const { default: traverse } = require("babel-traverse");
const template = require("babel-template");
const { parse, generate } = require("./helpers");
const t = require("babel-types");

function enterRequireModule(ast, callback) {
  let idx = 0;
  traverse(ast, {
    CallExpression: {
      enter(path) {
        if (path.node.callee.name !== "require") {
          return;
        }
        callback.call(this, path, idx);
        idx++;
      }
    }
  });
}

function code2data(code) {
  const reqModules = [];

  const ast = parse(code);

  enterRequireModule(ast, path => {
    const mod = path.get("arguments")[0];
    if (!mod) {
      console.warn("Require with no arguments");
      return;
    }
    const varDec = path.findParent(p => p.isVariableDeclarator());
    if (!varDec) {
      console.warn(
        `Not able to find variable declarator for ${mod.node.value}`
      );
      return;
    }
    const id = varDec.get("id");
    const variables = id.isObjectPattern()
      ? id.get("properties").map(prop => prop.get("value").node.name)
      : id.node.name;
    reqModules.push({ module: mod.node.value, variables });
  });

  return {
    requires: reqModules
  };
}

function genRequireAst({ module: mod, variables }) {
  const buildRequire = template(
    `
  const VARIABLES = require(MODULE);
`
  );
  return buildRequire({
    VARIABLES: Array.isArray(variables)
      ? t.objectPattern(
          variables.map(vari =>
            t.objectProperty(
              t.identifier(vari),
              t.identifier(vari),
              false,
              true
            ))
        )
      : t.identifier(variables),
    MODULE: t.stringLiteral(mod)
  });
}

function requiresAdded(ast, diff) {
  if (diff.path.length === 2) {
    const reqAst = genRequireAst(diff.value);
    traverse(ast, {
      Program: {
        enter(path) {
          path.node.body.splice(diff.leftKey, 0, reqAst);
        }
      }
    });
    return;
  }
  const [, , reqIndx, key] = diff.path;
  const requireIndx = parseInt(reqIndx, 10);
  if (key !== "variables") {
    return;
  }

  let added = false;
  enterRequireModule(ast, (path, idx) => {
    if (added || idx !== requireIndx) {
      return;
    }
    const varDecId = path.findParent(p => p.isVariableDeclarator()).get("id");
    const newProp = t.objectProperty(
      t.identifier(diff.value),
      t.identifier(diff.value),
      false,
      true
    );
    added = true;
    if (varDecId.isIdentifier()) {
      const idName = varDecId.node.name;
      varDecId.replaceWith(
        t.objectPattern([
          t.objectProperty(
            t.identifier(idName),
            t.identifier(idName),
            false,
            true
          ),
          newProp
        ])
      );
      return;
    }
    if (varDecId.isObjectPattern()) {
      varDecId.node.properties.splice(diff.leftKey, 0, newProp);
    }
  });
}

function requiresModified(ast, diff) {
  const [, , reqIndx, key] = diff.path;
  const requireIndx = parseInt(reqIndx, 10);

  enterRequireModule(ast, (path, idx) => {
    if (idx !== requireIndx) {
      return;
    }
    if (diff.leftKey === "module") {
      path.traverse({
        StringLiteral: {
          enter(sPath) {
            if (sPath.node.value !== diff.value) {
              sPath.replaceWith(t.stringLiteral(diff.value));
            }
          }
        }
      });
      return;
    }

    if (key === "variables") {
      const varDecId = path.findParent(p => p.isVariableDeclarator()).get("id");
      if (varDecId.isIdentifier() && varDecId.node.name !== diff.value) {
        varDecId.replaceWith(t.identifier(diff.value));
        return;
      }
      if (varDecId.isObjectPattern()) {
        varDecId.traverse({
          ObjectProperty: {
            enter(oPath) {
              if (oPath.node.value.name !== diff.value) {
                if (oPath.node.shorthand) {
                  oPath.replaceWith(
                    t.objectProperty(
                      t.identifier(diff.value),
                      t.identifier(diff.value),
                      false,
                      true
                    )
                  );
                } else {
                  oPath.replaceWith(
                    t.objectProperty(oPath.node.key, t.identifier(diff.value))
                  );
                }
              }
            }
          }
        });
      }
    }
  });
}

function requiresDeleted(ast, diff) {
  enterRequireModule(ast, path => {
    const varDecId = path.findParent(p => p.isVariableDeclarator()).get("id");
    if (varDecId.isObjectPattern()) {
      varDecId.get("properties").forEach((prop, pIndex) => {
        if (pIndex === diff.leftKey) {
          prop.remove();
        }
      });
    }
  });
}

const patchRequiresCode = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        requiresAdded(ast, diff);
        break;
      case "modified":
        requiresModified(ast, diff);
        break;
      case "deleted":
        requiresDeleted(ast, diff);
        break;
      default:
    }
  };

function data2code(code, diffs) {
  const ast = parse(code);
  const requiresDiffs = diffs.filter(diff => diff.path[1] === "requires");

  requiresDiffs.forEach(patchRequiresCode(ast));
  return generate(ast);
}

module.exports = {
  code2data,
  data2code
};

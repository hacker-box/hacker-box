const { default: traverse } = require("babel-traverse");
const t = require("babel-types");
const { parse, generate } = require("./helpers");
const template = require("babel-template");

function enterExportsAssignment(ast, callback) {
  traverse(ast, {
    AssignmentExpression: {
      enter(path) {
        const left = path.get("left");

        // exports =  --or-- module.exports =
        if (
          left.isIdentifier({ name: "exports" }) ||
          (left.isMemberExpression() &&
            left.get("object").isIdentifier({ name: "module" }) &&
            left.get("property").isIdentifier({ name: "exports" }))
        ) {
          callback.call(this, path);
        }
      }
    }
  });
}

function code2data(code) {
  const ast = parse(code);
  const moduleExports = [];
  enterExportsAssignment(ast, path => {
    const right = path.get("right");
    if (right.isIdentifier()) {
      moduleExports.push(right.node.name);
    }
    if (right.isObjectExpression()) {
      right.get("properties").forEach(prop => {
        if (prop.node.shorthand) {
          moduleExports.push(prop.get("key").node.name);
        } else {
          moduleExports.push({
            key: prop.get("key").node.name,
            value: prop.get("value").node.name
          });
        }
      });
    }
  });
  return {
    exports: moduleExports
  };
}

function exportsAdded(ast, diff) {
  let added = false;
  enterExportsAssignment(ast, path => {
    const right = path.get("right");
    added = true;
    if (right.isIdentifier()) {
      const props = [right.node.name, diff.value].map(prop =>
        t.objectProperty(t.identifier(prop), t.identifier(prop), false, true));
      right.replaceWith(t.objectExpression(props));
      return;
    }
    if (right.isObjectExpression()) {
      const prevProp = right.get("properties")[diff.leftKey - 1];
      if (prevProp) {
        prevProp.insertAfter(
          t.objectProperty(
            t.identifier(diff.value),
            t.identifier(diff.value),
            false,
            true
          )
        );
      } else {
        right.node.properties.push(
          t.objectProperty(
            t.identifier(diff.value),
            t.identifier(diff.value),
            false,
            true
          )
        );
      }
    }
  });
  if (diff.leftKey === 0 && !added) {
    // No module.exports statement.
    const exp = template(`module.exports = EXPORT_NAME`)({
      EXPORT_NAME: t.identifier(diff.value)
    });
    traverse(ast, {
      Program: {
        enter(path) {
          path.node.body.push(exp);
        }
      }
    });
  }
}

function exportsModified(ast, diff) {
  enterExportsAssignment(ast, path => {
    const right = path.get("right");
    if (right.isIdentifier()) {
      if (right.node.name !== diff.value) {
        right.replaceWith(t.identifier(diff.value));
      }
      return;
    }
    if (right.isObjectExpression()) {
      const leftKey = diff.path.length > 2
        ? parseInt(diff.path[2], 10)
        : diff.leftKey;
      const prop = right.get("properties")[leftKey];
      if (prop) {
        const key = prop.get("key");
        const value = prop.get("value");
        if (prop.node.shorthand) {
          if (key.node.name !== diff.value) {
            key.replaceWith(t.identifier(diff.value));
            value.replaceWith(t.identifier(diff.value));
          }
        } else {
          if (diff.leftKey === "key" && key.node.name !== diff.value) {
            key.replaceWith(t.identifier(diff.value));
          }
          if (diff.leftKey === "value" && value.node.name !== diff.value) {
            value.replaceWith(t.identifier(diff.value));
          }
        }
      }
    }
  });
}
function exportsDeleted(ast, diff) {
  enterExportsAssignment(ast, path => {
    const right = path.get("right");
    if (right.isObjectExpression()) {
      const prop = right.get("properties")[diff.leftKey];
      prop.remove();
    }
  });
}

const patchExportsCode = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        exportsAdded(ast, diff);
        break;
      case "modified":
        exportsModified(ast, diff);
        break;
      case "deleted":
        exportsDeleted(ast, diff);
        break;
      default:
    }
  };

function data2code(code, diffs) {
  const ast = parse(code);
  const exportDiffs = diffs.filter(diff => diff.path[1] === "exports");

  exportDiffs.forEach(patchExportsCode(ast));
  return generate(ast);
}

module.exports = {
  code2data,
  data2code
};

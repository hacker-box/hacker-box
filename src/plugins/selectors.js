const { default: traverse } = require("babel-traverse");
const template = require("babel-template");
const t = require("babel-types");
const _camelCase = require("lodash.camelcase");
const {
  parse,
  generate,
  enterCallWithNameIndex,
  lastRequire,
  reverseCamelCase
} = require("./helpers");

function code2data(code) {
  const ast = parse(code);
  const rootSelectors = [];
  const selectors = [];

  traverse(ast, {
    CallExpression: {
      enter(path) {
        if (!path.get("callee").isIdentifier({ name: "createSelector" })) {
          return;
        }
        const output = path
          .findParent(p => p.isVariableDeclarator())
          .get("id").node.name;
        const input = [];
        path
          .get("arguments")
          .forEach(arg => arg.isIdentifier() && input.push(arg.node.name));
        selectors.push({ input, output });
      }
    },

    MemberExpression: {
      enter(path) {
        // If there is one arg function and that arg is used as object
        // in member express. state => state.someting ;

        const mPath = path.get("object");
        if (!mPath.isIdentifier()) {
          return;
        }
        const fPath = path.findParent(p => p.isFunction());
        if (!fPath || path.findParent(p => p.isCallExpression())) {
          return;
        }
        const params = fPath.get("params");
        if (params.length !== 1 || params[0].node.name !== mPath.node.name) {
          return;
        }

        const vardec = path.findParent(p => p.isVariableDeclarator()) ||
          path.findParent(p => p.isFunctionDeclaration());
        if (vardec) {
          rootSelectors.push(vardec.get("id").node.name);
        }
      }
    }
  });

  return {
    rootSelectors,
    selectors
  };
}

function genRootSelector(output) {
  const stateKey = reverseCamelCase(output).toLowerCase().split("_")[1];
  const selectorBuilder = template(
    `
const OUTPUT = state => state.STATE_KEY;
`
  );
  return selectorBuilder({
    OUTPUT: t.identifier(output),
    STATE_KEY: t.identifier(stateKey ? stateKey : "changeMe")
  });
}

function enterRootSelector(ast, index, callback) {
  let idx = 0;
  traverse(ast, {
    MemberExpression: {
      enter(path) {
        // If there is one arg function and that arg is used as object
        // in member express. state => state.someting ;

        const mPath = path.get("object");
        if (!mPath.isIdentifier()) {
          return;
        }
        const fPath = path.findParent(p => p.isFunction());
        if (!fPath || path.findParent(p => p.isCallExpression())) {
          return;
        }
        const params = fPath.get("params");
        if (params.length !== 1 || params[0].node.name !== mPath.node.name) {
          return;
        }

        if (idx === index) {
          callback.call(this, path);
        }
        idx++;
      }
    }
  });
}

function rootSelectorAdded(ast, diff) {
  if (diff.path.length === 2) {
    let added = false;
    enterRootSelector(ast, diff.leftKey - 1, path => {
      const prevSel = path.findParent(p => p.isVariableDeclaration()) ||
        path.findParent(p => p.isFunctionDeclaration());
      if (prevSel) {
        added = true;
        prevSel.insertAfter(genRootSelector(diff.value));
      }
    });
    if (added) {
      return;
    }
    lastRequire(ast, path => {
      path.insertAfter(genRootSelector(diff.value));
    });
    return;
  }
}

function rootSelectorModified(ast, diff) {
  enterRootSelector(ast, diff.leftKey, path => {
    const output = path.findParent(p => p.isVariableDeclarator()) ||
      path.findParent(p => p.isFunctionDeclaration());
    if (!output) {
      return;
    }
    const fnId = output.get("id");
    if (fnId.node.name !== diff.value) {
      fnId.replaceWith(t.identifier(diff.value));
    }
  });
}

function rootSelectorDeleted(ast, diff) {
  enterRootSelector(ast, diff.leftKey, path => {
    const vardec = path.findParent(p => p.isVariableDeclaration()) ||
      path.findParent(p => p.isFunctionDeclaration());
    if (vardec) {
      vardec.remove();
    }
  });
}

const selector2arg = sel => _camelCase(sel.replace("Selector", ""));

function genSelector({ input, output }) {
  const selectorBuilder = template(
    `
const OUTPUT = createSelector(
  INPUT,
  (INPUT_VARIABLES) => {
  return;
})
`
  );

  const inputVariables = input.map(inp => t.identifier(selector2arg(inp)));

  return selectorBuilder({
    OUTPUT: t.identifier(output),
    INPUT: input.map(inp => t.identifier(inp)),
    INPUT_VARIABLES: inputVariables
  });
}

function selectorAdded(ast, diff) {
  if (diff.path.length === 2) {
    let added = false;
    enterCallWithNameIndex(ast, "createSelector", diff.leftKey - 1, path => {
      added = true;
      path
        .findParent(p => p.isVariableDeclaration())
        .insertAfter(genSelector(diff.value));
    });
    if (added) {
      return;
    }
    traverse(ast, {
      Program: {
        enter: path => {
          const idx = path.node.body.length - 1; // before export;
          path.node.body.splice(idx, 0, genSelector(diff.value));
        }
      }
    });
  }

  const [, , selectorIndex, leaf] = diff.path;
  enterCallWithNameIndex(ast, "createSelector", selectorIndex, path => {
    if (leaf === "input") {
      const args = path.node.arguments;
      args.splice(diff.leftKey, 0, t.identifier(diff.value));
      if (t.isFunction(args[args.length - 1])) {
        const params = args[args.length - 1].params;
        params.splice(diff.leftKey, 0, t.identifier(selector2arg(diff.value)));
      }
      // FIXME: handle when last arg is identifier
    }
  });
}

function selectorModified(ast, diff) {
  const [, , selectorIndex, leaf] = diff.path;
  enterCallWithNameIndex(ast, "createSelector", selectorIndex, path => {
    if (leaf === "input") {
      const args = path.get("arguments");
      const modArg = args[diff.leftKey];
      if (modArg.node.name !== diff.value) {
        modArg.replaceWith(t.identifier(diff.value));
        if (args[args.length - 1].isFunction()) {
          args[args.length - 1].node.params.splice(
            diff.leftKey,
            1,
            t.identifier(selector2arg(diff.value))
          );
        }
      }
      return;
    }
    // output changes
    const output = path.findParent(p => p.isVariableDeclarator()).get("id");
    if (output.node.name !== diff.value) {
      output.replaceWith(t.identifier(diff.value));
    }
  });
}

function selectorDeleted(ast, diff) {
  if (diff.path.length === 2) {
    enterCallWithNameIndex(ast, "createSelector", diff.leftKey, path => {
      path.findParent(p => p.isVariableDeclaration()).remove();
    });
    return;
  }

  const [, , selectorIndex, leaf] = diff.path;
  enterCallWithNameIndex(ast, "createSelector", selectorIndex, path => {
    if (leaf === "input") {
      const args = path.get("arguments");
      args[diff.leftKey].remove();
      if (args[args.length - 1].isFunction()) {
        const params = args[args.length - 1].node.params;
        params.splice(diff.leftKey, 1);
      }
    }
  });
}

const patchSelectorCode = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        selectorAdded(ast, diff);
        break;
      case "modified":
        selectorModified(ast, diff);
        break;
      case "deleted":
        selectorDeleted(ast, diff);
        break;
      default:
    }
  };

const patchRootSelectorCode = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        rootSelectorAdded(ast, diff);
        break;
      case "modified":
        rootSelectorModified(ast, diff);
        break;
      case "deleted":
        rootSelectorDeleted(ast, diff);
        break;
      default:
    }
  };

function data2code(code, diffs) {
  const ast = parse(code);
  const selectorDiffs = diffs.filter(diff => diff.path[1] === "selectors");
  const rootSelectorDiffs = diffs.filter(
    diff => diff.path[1] === "rootSelectors"
  );

  selectorDiffs.forEach(patchSelectorCode(ast));
  rootSelectorDiffs.forEach(patchRootSelectorCode(ast));
  return generate(ast);
}

const newFileContent = memo => ({
  ...memo,
  selectors: {
    doc: `
[
  { requires: [{ module: "reselect", variables: ["createSelector"] }] },
  {
    rootSelectors: ["getVisibilityFilter", "getTodos"],
    selectors: [
      {
        input: ["getVisibilityFilter", "getTodos"],
        output: "getVisibleTodos"
      },
      {
        input: ["subtotalSelector", "taxPercentSelector"],
        output: "taxSelector"
      }
    ]
  },
  { exports: ["getVisibleTodos", "taxSelector"] }
]`,
    src: `
const {createSelector} = require("reselect");

module.exports = {
};
`
  }
});

module.exports = {
  code2data,
  data2code,
  newFileContent
};

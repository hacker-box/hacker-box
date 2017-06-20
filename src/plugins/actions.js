const { default: traverse } = require("babel-traverse");
//const template = require("babel-template");
const t = require("babel-types");
const { parse, generate, reverseCamelCase, getFileName } = require("./helpers");
const _camelCase = require("lodash.camelcase");
const { addRequire, removeRequire, addRequireVariable } = require("./helpers");

function enterCreateActions(ast, callback) {
  let idx = 0;

  traverse(ast, {
    CallExpression: {
      enter(path) {
        if (!path.get("callee").isIdentifier({ name: "createActions" })) {
          return;
        }
        const acts = path.get("arguments")[0];

        if (!acts || !acts.isObjectExpression()) {
          console.warn("No arguments found for createActions()");
          return;
        }

        callback.call(this, path, idx);

        idx++;
      }
    }
  });
}

function code2data(code) {
  const actions = [];
  const identActions = [];

  const ast = parse(code);

  enterCreateActions(ast, path => {
    const acts = path.get("arguments")[0];
    acts.traverse({
      ObjectProperty: {
        enter(oPath) {
          const value = oPath.get("value");

          if (value.isObjectExpression()) {
            return;
          }

          const parentKeys = [_camelCase(oPath.get("key").node.name)];
          let poPath = oPath.parentPath.parentPath;
          while (poPath.isObjectProperty()) {
            parentKeys.unshift(poPath.get("key").node.name.toLowerCase());
            poPath = poPath.parentPath.parentPath;
          }

          actions.push({
            key: parentKeys.join("."),
            value: value.node.name
          });
        }
      }
    });

    path
      .get("arguments")
      .slice(1)
      .forEach(
        iAct => iAct.isStringLiteral() && identActions.push(iAct.node.value)
      );
  });
  return {
    actions,
    identActions
  };
}

function genProperty({ key, value }) {
  return t.objectProperty(
    t.identifier(reverseCamelCase(key)),
    t.identifier(value)
  );
}

function actionAdded(ast, diff) {
  if (diff.path.length === 2) {
    enterCreateActions(ast, path => {
      const actions = path.get("arguments")[0];
      actions.node.properties.splice(diff.leftKey, 0, genProperty(diff.value));
    });
    return;
  }
}

function actionModified(ast, diff) {}

function actionDeleted(ast, diff) {
  if (diff.path.length === 2) {
    enterCreateActions(ast, path => {
      const actions = path.get("arguments")[0];
      actions.node.properties.splice(diff.leftKey, 1);
    });
    return;
  }
}

const patchAction = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        actionAdded(ast, diff);
        break;
      case "modified":
        actionModified(ast, diff);
        break;
      case "deleted":
        actionDeleted(ast, diff);
        break;
      default:
    }
  };

function data2code(code, diffs) {
  const ast = parse(code);
  const actionDiffs = diffs.filter(diff => diff.path[1] === "actions");
  actionDiffs.forEach(patchAction(ast));
  return generate(ast);
}

const newFileContent = memo => ({
  ...memo,
  actions: {
    doc: `
[
  { requires: [{ module: "redux-actions", variables: ["createActions"] }] },
  {
    actions: [{ key: "getUser", value: "getUser" }],
    identActions: ["setCurrentItem"]
  },
  { exports: ["actions"] }
]`,
    src: `
const {createActions} = require("redux-actions");

const actions = createActions({
});

module.exports = actions;
`
  }
});

const addAction = suggestion =>
  data => {
    const actionItem = data.find(item => item.actions);
    if (!actionItem) {
      console.warn("Not able to file actions block in data", data, suggestion);
      return data;
    }
    actionItem.actions.push({ key: suggestion, value: suggestion });
    return data;
  };

const removeAction = suggestion =>
  data => {
    const actionItem = data.find(item => item.actions);
    if (!actionItem) {
      console.warn("Not able to file actions block in data", data, suggestion);
      return data;
    }
    const actionIdx = actionItem.actions.findIndex(
      ac => ac.value === suggestion
    );
    if (actionIdx !== -1) {
      actionItem.actions.splice(actionIdx, 1);
    }
    return data;
  };

function suggestions(memo, file, left) {
  const suggestions = [];
  const { fileId, filePath, action: diff } = memo.update;
  const { action, path, value } = diff;
  const [, codeType] = path;
  const fileName = getFileName(filePath);

  if (codeType === "webapis" && path.length === 2) {
    if (fileName === getFileName(file.path)) {
      if (action === "added") {
        suggestions.push({
          action: addAction(value.name),
          caption: `Add Action "${value.name}"`
        });
      } else if (action === "deleted") {
        suggestions.push({
          action: removeAction(value.name),
          caption: `Remove Action "${value.name}"`
        });
      }
    }
  }

  if (codeType === "actions" && path.length === 2 && fileId === file.uid) {
    const modName = `../webapi/${fileName}`;
    const modIndex = ((file.data.find(d => !!d.requires) || {}).requires || [])
      .findIndex(req => req.module === modName);
    if (action === "added") {
      suggestions.push({
        action: modIndex === -1
          ? addRequire({
              module: `../webapi/${fileName}`,
              variables: [value.value]
            })
          : addRequireVariable(modIndex, value.value),
        caption: `Add require() for "${value.value}"`
      });
    } else if (action === "deleted") {
      suggestions.push({
        action: removeRequire({
          module: `../webapi/${fileName}`,
          variables: [value.value]
        }),
        caption: `Remove require() for "${value.value}"`
      });
    }
  }

  return {
    ...memo,
    suggestions: memo.suggestions.concat(suggestions)
  };
}

module.exports = {
  code2data,
  data2code,
  suggestions,
  newFileContent
};

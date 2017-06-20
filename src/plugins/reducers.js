const { default: traverse } = require("babel-traverse");
const template = require("babel-template");
const t = require("babel-types");
const {
  parse,
  generate,
  reverseCamelCase,
  getFileName,
  lastRequire
} = require("./helpers");
const _camelCase = require("lodash.camelcase");

function enterHandleActions(ast, callback) {
  let idx = 0;

  traverse(ast, {
    CallExpression: {
      enter(path) {
        if (!path.get("callee").isIdentifier({ name: "handleActions" })) {
          return;
        }
        const acts = path.get("arguments")[0];

        if (!acts || !acts.isObjectExpression()) {
          console.warn("No arguments found for handleActions()");
          return;
        }

        callback.call(this, path, idx);

        idx++;
      }
    }
  });
}

function code2data(code) {
  const reducers = [];

  const ast = parse(code);

  enterHandleActions(ast, path => {
    const oexps = path.get("arguments")[0];
    oexps.get("properties").forEach(op => {
      const key = op.get("key").node.name;
      const valuePath = op.get("value");
      let value = valuePath.node.name;
      if (valuePath.isObjectExpression()) {
        const nextPath = valuePath
          .get("properties")
          .find(p => p.get("key").isIdentifier({ name: "next" }));
        if (nextPath) {
          value = nextPath.get("value").node.name;
        }
      }
      reducers.push({ key, value });
    });
  });
  return {
    reducers
  };
}

function genReducerFunction({ key, value }) {
  const stateKey = reverseCamelCase(value).split("_").pop().toLowerCase();
  const reducerBuilder = template(
    `
const FUNCTION_NAME = (state, {payload, error}) => !error && update(state,{STATE_KEY: {$set: payload}});
    `
  );

  return reducerBuilder({
    FUNCTION_NAME: t.identifier(value),
    STATE_KEY: t.identifier(stateKey)
  });
}

function genProperty({ key, value }) {
  return t.objectProperty(t.identifier(key), t.identifier(value));
}

function reducerAdded(ast, diff) {
  if (diff.path.length === 2) {
    enterHandleActions(ast, path => {
      const reducers = path.get("arguments")[0];
      reducers.node.properties.splice(diff.leftKey, 0, genProperty(diff.value));
    });

    lastRequire(
      ast,
      (lastReq, progPath) =>
        lastReq
          ? lastReq.insertAfter(genReducerFunction(diff.value))
          : progPath.node.body.splice(0, 0, genReducerFunction(diff.value))
    );

    return;
  }
}

function reducerModified(ast, diff) {}

function reducerDeleted(ast, diff) {
  if (diff.path.length === 2) {
    enterHandleActions(ast, path => {
      const reducers = path.get("arguments")[0];
      reducers.node.properties.splice(diff.leftKey, 1);
    });
    return;
  }
}

const patchReducer = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        reducerAdded(ast, diff);
        break;
      case "modified":
        reducerModified(ast, diff);
        break;
      case "deleted":
        reducerDeleted(ast, diff);
        break;
      default:
    }
  };

function data2code(code, diffs) {
  const ast = parse(code);
  const reducerDiffs = diffs.filter(diff => diff.path[1] === "reducers");
  reducerDiffs.forEach(patchReducer(ast));
  return generate(ast);
}

const newFileContent = memo => ({
  ...memo,
  reducers: {
    doc: `
[
  {
    requires: [
      { module: "redux-actions", variables: ["handleActions"] },
      { module: "immutability-helper", variables: ["update"] }
    ]
  },
  {
    reducers: [
      { key: "GET_USER", value: "receiveUser" },
      { key: "CREATE_ITEM", value: "createItem" }
    ]
  },
  { exports: ["actions"] }
]`,
    src: `
const {handleActions} = require("redux-actions");
const update = require("immutability-helper");

const defaultState = {
};

const actions = handleActions({
}, defaultState);

module.exports = actions;
`
  }
});

const addReducer = suggestion =>
  data => {
    const reducerItem = data.find(item => item.reducers);
    if (!reducerItem) {
      console.warn("Not able to file reducers block in data", data, suggestion);
      return data;
    }
    reducerItem.reducers.push({
      key: reverseCamelCase(suggestion),
      value: suggestion
    });
    return data;
  };

const removeReducer = suggestion =>
  data => {
    const reducerItem = data.find(item => item.actions);
    if (!reducerItem) {
      console.warn("Not able to file reducers block in data", data, suggestion);
      return data;
    }
    const reducerIdx = reducerItem.reducers.findIndex(
      ac => ac.value === suggestion
    );
    if (reducerIdx !== -1) {
      reducerItem.reducers.splice(reducerIdx, 1);
    }
    return data;
  };

function suggestions(memo, file) {
  const suggestions = [];
  const { filePath, action: diff } = memo.update;
  const { action, path, value } = diff;
  const [, codeType] = path;

  if (codeType === "webapis" && path.length === 2) {
    if (getFileName(filePath) === getFileName(file.path)) {
      if (action === "added") {
        suggestions.push({
          action: addReducer(value.name),
          caption: `Add Reducer "${value.name}"`
        });
      } else if (action === "deleted") {
        suggestions.push({
          action: removeReducer(value.name),
          caption: `Remove Reducer "${value.name}"`
        });
      }
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

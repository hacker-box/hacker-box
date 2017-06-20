const { createCodeBlock } = require("../../common/components/codeslate");
const _camelCase = require("lodash.camelcase");
const {
  reverseCamelCase,
  stripDotJs,
  getFileName
} = require("../../common/utils/Helpers");

function getActionClientCode(actionName) {
  return `
const { applyMiddleware, createStore } = require("redux");
const reduxPromise = require("redux-promise");
const loggerMiddleware = require("redux-logger");

const action = require("../../actions/${actionName}");
const reducer = require("../../reducers/${actionName}");

const store = applyMiddleware(
  reduxPromise,
  loggerMiddleware({ logger: console })
)(createStore)(reducer);
store.subscribe(() => {
  if (window.parent) {
    window.parent.postMessage(
      JSON.stringify({ action: "setState", data: store.getState() }),
      "*"
    );
  }
});
store.dispatch(action());
`;
}

function createActionCode({ actionType, apiName }) {
  if (apiName) {
    return `
const { createAction } = require('redux-actions');
const ${apiName} = require("../webapi");

module.exports = createAction('${actionType}', ${apiName});
`;
  }

  return `
const {createAction} = require('redux-actions');
module.exports = createAction('${actionType}')
`;
}

const ACTION_REGEX = /createAction\s*\(\s*['"]([^'"]*)/;

function getActionName(actionCode) {
  return _camelCase(
    actionCode
      .match(ACTION_REGEX)[1]
      .split("_")
      .slice(1)
      .join("_")
      .toUpperCase()
  );
}

const actionsFile = `
const { createActions } = require("redux-actions");

const actions = createActions({
});

module.exports = actions;
`;

function getWebApiActionsCode({ filePath, functionName }) {
  const fileName = getFileName(filePath);
  return `
const ${fileName} = require("../${stripDotJs(filePath)}");
const actions = createActions({
  ${reverseCamelCase(functionName)} : ${fileName}.${functionName}
})
`;
}

const webapiDefaults = {
  filePath: "webapi/index.js",
  functioName: "getSomething"
};

function getTriggerActionContent(file, action) {
  const { key } = action;
  const { path } = file;

  const code = `
const React = require("react");
const { connect } = require("react-redux");
const {${key}} = require("../../../${path}");
const { DevConsole } = require("../../common/components/devconsole");

class ActionTrigger extends React.Component {
  state = {
    done: false
  };
  componentWillMount = () => {
    const act = this.props.triggerAction();
    if (act && act.then && typeof act.then === "function") {
      act.then(() => this.setState({ done: true }));
    } else {
      this.setState({ done: true });
    }
  };

  render() {
    return <DevConsole done={this.state.done} />;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    triggerAction: () => dispatch(${key}())
  };
}

module.exports = connect(null, mapDispatchToProps)(ActionTrigger);
  `;

  return {
    code,
    path: "src/containers/test/ActionTrigger.js"
  };
}

module.exports = {
  actionsFile,
  getActionName,
  getActionClientCode,
  getWebApiActionsCode,
  webapiDefaults,
  getTriggerActionContent,
  createActionCode: actionParts =>
    createCodeBlock(createActionCode(actionParts))
};

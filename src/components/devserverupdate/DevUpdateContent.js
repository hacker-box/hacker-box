function getTriggerActionContent(updateType, file, action) {
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
    uid: `${updateType}_FILE`,
    urlPath: "test/action",
    path: "src/containers/test/ActionTrigger.js"
  };
}

function getTriggerSelectorContent(updateType, file, action, data) {
  const code = `
const React = require('react');
const { DevConsole } = require("../../common/components/devconsole");
const CustomLogger = require("../../common/utils/CustomLogger");
const {${action.output}} = require("../../../${file.path}");

const reduxState = ${JSON.stringify(data.state, null, 2)};

class SelectorTrigger extends React.Component {

  componentWillMount = () => CustomLogger.log("%c ${action.output}","font-weight: bold",${action.output}(reduxState));

  render() {
    return <DevConsole done={true} />;
  }
}

module.exports = SelectorTrigger;

    `;

  return {
    code,
    uid: `${updateType}_FILE`,
    urlPath: "test/selector",
    path: "src/containers/test/SelectorTrigger.js"
  };
}

function devUpdateContent(updateType, file, action, data) {
  let content = {};
  switch (updateType) {
    case "ACTION_TRIGGER":
      content = getTriggerActionContent(updateType, file, action);
      break;

    case "SELECTOR_TRIGGER":
      content = getTriggerSelectorContent(updateType, file, action, data);
      break;

    default:
      break;
  }
  return content;
}

module.exports = devUpdateContent;

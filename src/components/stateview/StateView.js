const React = require("react");
const { default: JSONTree } = require("react-json-tree");
const { connect } = require("react-redux");
const { AppsActions } = require("../../actions");
const theme = require("./theme.css");
const { getMessage } = require("../../common/utils/MessageUtil");
const classnames = require("classnames");

class StateView extends React.Component {
  state = {
    appState: {}
  };

  receivePostMessage = event => {
    const { appId, frameUrl } = this.props;
    const { appState } = this.state;
    if (!frameUrl || frameUrl.indexOf(event.origin) !== 0) {
      console.warn(
        `Discarding postMessage "${event.origin}" !== "${frameUrl}"`
      );
      return;
    }
    try {
      const message = JSON.parse(event.data);
      if (message.action === "setState") {
        const devServerState = { ...appState, ...message.data };
        this.setState({
          appState: devServerState
        });
        this.props.setDevServerState({ appId, devServerState });
      }
    } catch (err) {
      console.error(err);
    }
  };

  componentDidMount = () =>
    typeof window !== "undefined" &&
    window.addEventListener("message", this.receivePostMessage, false);

  componentWillUnmount = () =>
    typeof window !== "undefined" &&
    window.removeEventListener("message", this.receivePostMessage);

  render() {
    const { appState } = this.state;
    const className = classnames(theme.state, this.props.className);

    return (
      <div className={className}>
        <div className={theme.heading}>{getMessage("state.view")}</div>
        {appState && <JSONTree theme="mocha" data={appState} hideRoot={true} />}
      </div>
    );
  }
}

function mapDispachToProps(dispatch) {
  return {
    setDevServerState: state => dispatch(AppsActions.setDevServerState(state))
  };
}

module.exports = connect(null, mapDispachToProps)(StateView);

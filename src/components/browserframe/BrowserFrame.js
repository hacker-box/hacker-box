const React = require("react");
const { Input, Button, IconButton } = require("react-toolbox");
const { connect } = require("react-redux");
const theme = require("./theme.css");
const { getMessage } = require("../../common/utils/MessageUtil");
const { runCommandCreator } = require("../terminal");
const { AppsActions } = require("../../actions");
const keycode = require("keycode");
const { StateView } = require("../stateview");

const getUrl = data => {
  const { devServerUrl, devServerPath } = data;
  return devServerPath ? devServerUrl + devServerPath : devServerUrl;
};

class BrowserFrame extends React.Component {
  state = {
    reload: false,
    url: ""
  };

  componentWillReceiveProps = nextProps => {
    const { devServerStartTime } = nextProps.data;
    this.setState({
      reload: devServerStartTime !== this.props.data.devServerStartTime,
      url: getUrl(nextProps.data)
    });
  };

  componentDidUpdate = () => {
    const { reload } = this.state;
    if (reload && this.iframe) {
      this.iframe.src = getUrl(this.props.data);
      this.setState({ reload: false });
    }
  };

  handleUrlChange = ev => {
    if (keycode(ev) !== "enter") {
      return;
    }
    const { appId } = this.props;
    const { devServerUrl } = this.props.data;
    const { url } = this.state;
    const path = url.substring(devServerUrl.length);
    this.props.setPath(appId, path);
  };

  render() {
    const {
      appId,
      userId,
      data,
      connected
    } = this.props;
    const url = getUrl(data);
    if (!url) {
      this.iframe = null;
      return (
        <div className={theme.start}>
          <Button
            raised
            primary
            disabled={!connected}
            onClick={() => this.props.startDevServer(appId, userId)}
          >
            {getMessage("start.dev.server")}
          </Button>
        </div>
      );
    }
    return (
      <div className={theme.browser}>
        <div className={theme.bar}>
          <IconButton
            icon="refresh"
            onClick={() => this.iframe.src = getUrl(data)}
          />
          <Input
            className={theme.url}
            value={this.state.url}
            onChange={url => this.setState({ url })}
            onKeyPress={this.handleUrlChange}
          />
        </div>
        <div className={theme.frameContent}>
          <iframe
            ref={ifr => this.iframe = ifr}
            frameBorder="0"
            src={url}
            className={theme.frame}
          />
          <StateView appId={appId} className={theme.state} frameUrl={data.devServerUrl} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    startDevServer: (appId, userId) => {
      dispatch(AppsActions.toggleCommand(true));
      runCommandCreator(dispatch)({ userId, appId, command: "yarn dev" });
    },
    setPath: (appId, devServerPath) =>
      dispatch(AppsActions.setDevServerPath({ appId, devServerPath }))
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(BrowserFrame);

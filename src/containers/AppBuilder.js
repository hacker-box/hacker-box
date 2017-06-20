const React = require("react");
const { connect } = require("react-redux");
const {
  Layout,
  Panel,
  NavDrawer,
  Drawer,
  AppBar,
  Button
} = require("react-toolbox");
const { CmdBar } = require("../components/cmdbar");
const { BrowserFrame } = require("../components/browserframe");
const theme = require("./AppBuilder.css");
const {
  CurrentAppSelector,
  UserSelector,
  CliSelector,
  FakersSelector,
  AppDataSelector
} = require("../selectors");
const { AppsActions } = require("../actions");
const { FileActions } = require("../components/fileeditor");
const { StateView } = require("../components/stateview");
const { StateSteps } = require("../components/statesteps");
const { BarActions } = require("../components/baractions");

const classnames = require("classnames");

class AppBuilder extends React.Component {
  state = {
    toggleSidebar: true,
    rightSlide: 90
  };

  componentWillMount = () => {
    const { match, user } = this.props;
    const appId = match.params.appId;

    this.props.setCurrent(appId);
    this.props.getAppInfo(user.uid, appId);
  };

  handleBackClick = () => {
    const { history, user } = this.props;
    history.push(`/user/${user.uid}`);
  };

  handleMouseEnter = () =>
    this.tout = setTimeout(() => this.setState({ rightSlide: 30 }), 300);

  handleMouseLeave = () => {
    clearTimeout(this.tout);
    this.setState({ rightSlide: 90 });
  };

  render() {
    const { app, user, cli, appData } = this.props;
    const { rightSlide } = this.state;
    const rightClass = classnames(theme.rightDraw, {
      [theme.right30]: rightSlide === 30,
      [theme.right90]: rightSlide === 90
    });
    return (
      <div>
        <AppBar
          fixed
          title={`${app.meta ? "Home: " + app.meta.appName : ""}`}
          leftIcon="arrow_back"
          onLeftIconClick={this.handleBackClick}
        >
          <BarActions />
        </AppBar>
        <Layout theme={theme} className={theme.draws}>
          <NavDrawer fixed pinned={false} className={theme.draws}>
            <StateView frameUrl={appData.devServerUrl} />
          </NavDrawer>
          <Panel>
            {app.uid && <StateSteps app={app} />}
          </Panel>
          <Drawer
            active={!!cli}
            withOverlay={false}
            type="right"
            className={rightClass}
          >
            <BrowserFrame
              data={appData}
              appId={app.uid}
              userId={user.uid}
              connected={!!cli}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
            />
            <Button
              icon={rightSlide === 30 ? "arrow_forward" : "arrow_back"}
              floating
              mini
              className={theme.arrow}
              onClick={() =>
                this.setState({ rightSlide: rightSlide === 30 ? 90 : 30 })}
            />
          </Drawer>
          <CmdBar />
        </Layout>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: UserSelector(state),
    cli: CliSelector(state),
    app: CurrentAppSelector(state),
    fakers: FakersSelector(state),
    appData: AppDataSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrent: appId => appId && dispatch(AppsActions.setCurrent(appId)),
    getAppInfo: (userId, appId) => {
      if (!appId) {
        return;
      }
      dispatch(AppsActions.getAppInfo(userId, appId)).then(({ payload: app }) =>
        dispatch(FileActions.getFiles(app.uid, Object.keys(app.files || {}))));
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AppBuilder);

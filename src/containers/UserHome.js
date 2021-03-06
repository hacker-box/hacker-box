const React = require("react");
const { Link } = require("react-router-dom");
const {
  Card,
  CardTitle,
  CardActions,
  Button,
  AppBar,
  NavDrawer,
  FontIcon
} = require("react-toolbox");
const theme = require("./UserHome.css");
const { connect } = require("react-redux");
const { AppsActions } = require("../actions");
const { Prompt } = require("../components/prompt");
const { getMessage } = require("../common/utils/MessageUtil");
const {
  UserSelector,
  AppListSelector
} = require("../selectors");
const { BarActions } = require("../components/baractions");

const AppCard = props => {
  const { app } = props;

  return (
    <Card className={theme.appCard}>
      <CardTitle title={app.meta && app.meta.appName} />
      <CardActions>
        <Link to={`/app/${app.uid}`}>
          <Button primary label={getMessage("label.open")} />
        </Link>
      </CardActions>
    </Card>
  );
};

class UserHome extends React.Component {
  state = {
    showNav: false
  };

  handleToggle = () => this.setState({ showNav: !this.state.showNav });

  componentWillMount = () => {
    this.props.getUserApps(this.props.user);
    this.props.setCurrent(null);
  };

  render() {
    const { apps, user } = this.props;
    const { showNav } = this.state;
    return (
      <div className={theme.userHome}>
        <NavDrawer fixed active={showNav} onOverlayClick={this.handleToggle} />
        <AppBar
          onLeftIconClick={this.handleToggle}
          title={getMessage("app.title")}
        >
          <BarActions />
        </AppBar>
        <Prompt
          icon="add"
          floating
          accent
          theme={theme}
          tooltip={getMessage("add.app")}
          tooltipPosition="bottom"
          dialogTitle={getMessage("add.app")}
          inputLabel={getMessage("add.app.label")}
          buttonLabel={getMessage("add.app")}
          onPromptEnter={promptInput =>
            this.props.addApp(user.uid, { appName: promptInput })}
        />
        <div className={theme.appWrapper}>
          {apps.map((app, idx) => <AppCard key={idx} app={app} />)}
        </div>
        <div className={theme.intro}>
          <div>
            <div>
              This web playground is a proof of concept to expore the ability
              to automate by extracting and patching JSON to/from code for specific frameworks.
              Start by adding an app and try editing the files. Changing JSON should update code
              and visa versa.
              {" "}
              <Link to="/intro/video">See a quick screencast</Link>
            </div>
            <h4>What is coming next?</h4>
            <div>
              An Atom Package implementing these concepts. Everytime you edit a file, An event with JSON payload
              containing the diff will be received allowing the developers to modify
              related code across files. Modifying code is as simple as manipulating the JSON.
              {" "}
              The plugins for each framework will do the hard work of translating between JSON
              {" "}
              <FontIcon className={theme.ticon} value="compare_arrows" />
              {" "}
              CODE
              <br /><br />
              Think of it as an IFTTT style automation for code. Follow @HackerHyperBox
              on Twitter for updates.
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: UserSelector(state),
    apps: AppListSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getUserApps: user =>
      dispatch(AppsActions.getUserApps(user.uid)).then(({ payload: appIds }) =>
        Object.keys(appIds).map(appId =>
          dispatch(AppsActions.getAppInfo(user.uid, appId)))),
    addApp: (userId, app) =>
      dispatch(AppsActions.addApp(userId, app)).then(({ payload: app }) => {
        dispatch(AppsActions.addState(userId, app.uid));
        // create index files.
        dispatch(
          AppsActions.addFile(userId, app.uid, {
            path: "src/webapi/index.js",
            module: "webapiIndex",
            data: []
          })
        );
        dispatch(
          AppsActions.addFile(userId, app.uid, {
            path: "src/actions/index.js",
            module: "actionsIndex",
            data: []
          })
        );
        dispatch(
          AppsActions.addFile(userId, app.uid, {
            path: "src/reducers/index.js",
            module: "reducersIndex",
            data: []
          })
        );
      }),
    setCurrent: appId => dispatch(AppsActions.setCurrent(appId))
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(UserHome);

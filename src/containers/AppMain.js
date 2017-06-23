const React = require("react");
const StandardLayout = require("../common/containers/StandardLayout");
const { Switch, Route, Redirect } = require("react-router-dom");
const UserHome = require("./UserHome");
const { connect } = require("react-redux");
const { UserSelector, LocationSelector } = require("../selectors");
const AppBuilder = require("./AppBuilder");
const FileContainer = require("./FileContainer");
const FrontPage = require("./FrontPage");
const firebase = require("firebase");
const { onUserCreator } = require("../common/firebase");
const { UserActions } = require("../actions");
const { AppBar, ProgressBar } = require("react-toolbox");
const theme = require("./AppMain.css");

const Spinner = props => {
  return (
    <div>
      <AppBar fixed title="HACKER-BOX" />
      <ProgressBar className={theme.spinner} mode="indeterminate" />
    </div>
  );
};

const IntroVideo = props => {
  return (
    <div className={theme.intro}>
      <AppBar
        fixed
        title="Home"
        leftIcon="arrow_back"
        onLeftIconClick={() => props.history.goBack()}
      />
      <iframe
        className={theme.video}
        width="1280"
        height="720"
        src="https://www.youtube.com/embed/TvFeTzmZY50"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
};

const AppMain = props => {
  const { user, location } = props;
  return (
    <StandardLayout>
      <Switch location={location}>
        <Route path="/" exact component={FrontPage} />
        <Route
          path="/user"
          exact
          render={() => {
            if (user) {
              return <Redirect to={`/user/${user.uid}`} />;
            }
            props.createUser();
            return <Spinner />;
          }}
        />
        <Route path="/user/:userId" component={user && UserHome} />
        <Route path="/app/:appId" component={user && AppBuilder} />
        <Route path="/file/:fileId" component={user && FileContainer} />
        <Route path="/intro/video" component={IntroVideo} />
      </Switch>
    </StandardLayout>
  );
};

function mapStateToProps(state) {
  return {
    user: UserSelector(state),
    location: LocationSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createUser: () => {
      const onUser = onUserCreator(dispatch, UserActions);
      dispatch(UserActions.getUserToken()).then(({ payload: res }) =>
        firebase
          .auth()
          .signInWithCustomToken(res.body.token)
          .then(anon => onUser(anon.toJSON())));
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AppMain);

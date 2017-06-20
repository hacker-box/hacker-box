const React = require("react");
const { connect } = require("react-redux");
const {
  CurrentAppSelector,
  UserSelector,
  DevServerUrlSelector,
  CurrentAppContent,
  HboxAppData,
  CliSelector
} = require("../../selectors");
const { runCommandCreator } = require("../terminal");
const { UserActions } = require("../../actions");
const { getLastWriteData } = require("../../common/utils/Helpers");
const { AppsActions } = require("../../actions");
const devUpdateContent = require("./DevUpdateContent");

function devServerUpdate(updateType) {
  const devServerFunc = props => {
    const {
      user,
      app,
      devUrl,
      hboxApp,
      appContent,
      cli,
      file,
      actionData
    } = props;
    return React.cloneElement(
      React.Children.only(props.children),
      {
        ...props.children.props,
        devUrl,
        onTriggerAction: action =>
          props.triggerAction(
            user.uid,
            app.uid,
            file,
            hboxApp,
            action,
            appContent,
            cli,
            actionData
          )
      },
      props.children
    );
  };

  function mapStateToProps(state) {
    return {
      user: UserSelector(state),
      app: CurrentAppSelector(state),
      devUrl: DevServerUrlSelector(state),
      appContent: CurrentAppContent(state),
      hboxApp: HboxAppData(state),
      cli: CliSelector(state)
    };
  }

  function mapsDispatchToProps(dispatch) {
    return {
      triggerAction: (
        userId,
        appId,
        file,
        hboxApp,
        action,
        appContent,
        cli,
        actionData
      ) => {
        const { path, code, urlPath: devServerPath, uid } = devUpdateContent(
          updateType,
          file,
          action,
          actionData
        );
        appContent.push({ uid, path, code });
        runCommandCreator(dispatch, {
          onDone: () => {
            dispatch(AppsActions.setDevServerPath({ appId, devServerPath }));
            const hboxFiles = getLastWriteData(appContent, hboxApp.files || {});
            const hboxData = {
              ...cli.hbox,
              apps: {
                ...cli.hbox.apps,
                [appId]: { ...cli.hbox.apps[appId], files: hboxFiles }
              }
            };
            dispatch(UserActions.setCliData(userId, cli.uid, hboxData));
          }
        })({
          appId,
          userId,
          command: `writeFileBulk ${hboxApp.root}`,
          content: appContent
        });
      }
    };
  }

  return connect(mapStateToProps, mapsDispatchToProps)(devServerFunc);
}

module.exports = devServerUpdate;

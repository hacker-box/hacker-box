const React = require("react");
const { connect } = require("react-redux");
const ActionFile = require("./ActionFile");
const theme = require("./ActionStep.css");
const { Card, CardActions } = require("react-toolbox");
const { Prompt } = require("../prompt");
const { getMessage } = require("../../common/utils/MessageUtil");
const { AppsActions } = require("../../actions");
const { runCommandCreator } = require("../terminal");
const { getTriggerActionContent } = require("./ActionUtils");
const { getLastWriteData } = require("../../common/utils/Helpers");
const { UserActions } = require("../../actions");
const IndexFile = require("../webapistep/IndexFile");

const {
  CurrentAppSelector,
  ActionFilesSelector,
  UserSelector,
  DevServerUrlSelector,
  CurrentAppContent,
  HboxAppData,
  CliSelector
} = require("../../selectors");

const ActionStep = props => {
  const { user, app, files, devUrl, hboxApp, appContent, cli } = props;
  return (
    <div className={theme.files}>
      {files &&
        files.map(
          file =>
            file.module.indexOf("Index") === -1
              ? <ActionFile
                  key={file.uid}
                  file={file}
                  devUrl={devUrl}
                  onTriggerAction={action =>
                    props.triggerAction(
                      user.uid,
                      app.uid,
                      file,
                      hboxApp,
                      action,
                      appContent,
                      cli
                    )}
                />
              : <IndexFile key={file.uid} file={file} />
        )}
      <Card className={theme.add}>
        <CardActions>
          <Prompt
            icon="add"
            promptInput="src/actions/"
            label={getMessage("add.file")}
            dialogTitle={getMessage("file.path")}
            inputLabel={getMessage("file.path.label")}
            buttonLabel={getMessage("add.file")}
            onPromptEnter={promptInput => props.addFile(user, app, promptInput)}
          />
        </CardActions>
      </Card>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    user: UserSelector(state),
    app: CurrentAppSelector(state),
    files: ActionFilesSelector(state),
    devUrl: DevServerUrlSelector(state),
    appContent: CurrentAppContent(state),
    hboxApp: HboxAppData(state),
    cli: CliSelector(state)
  };
}

function mapsDispatchToProps(dispatch) {
  return {
    addFile: (user, app, path) =>
      dispatch(
        AppsActions.addFile(user.uid, app.uid, {
          path,
          module: "actions",
          data: []
        })
      ),
    triggerAction: (
      userId,
      appId,
      file,
      hboxApp,
      action,
      appContent,
      { uid, hbox }
    ) => {
      const { path, code } = getTriggerActionContent(file, action);
      appContent.push({ uid: "ACTION_FILE", path, code });
      runCommandCreator(dispatch, {
        onDone: () => {
          dispatch(
            AppsActions.setDevServerPath({ appId, devServerPath: "test/action" })
          );
          const hboxFiles = getLastWriteData(appContent, hboxApp.files || {});
          const hboxData = {
            ...hbox,
            apps: {
              ...hbox.apps,
              [appId]: { ...hbox.apps[appId], files: hboxFiles }
            }
          };
          dispatch(UserActions.setCliData(userId, uid, hboxData));
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
module.exports = connect(mapStateToProps, mapsDispatchToProps)(ActionStep);

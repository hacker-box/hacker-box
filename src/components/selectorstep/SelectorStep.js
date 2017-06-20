const React = require("react");
const { connect } = require("react-redux");
const SelectorFile = require("./SelectorFile");
const theme = require("./SelectorStep.css");
const { Card, CardActions } = require("react-toolbox");
const { Prompt } = require("../prompt");
const { getMessage } = require("../../common/utils/MessageUtil");
const { AppsActions } = require("../../actions");
const DevServerUpdate = require("../devserverupdate/DevServerUpdate")(
  "SELECTOR_TRIGGER"
);
const {
  SelectorFilesSelector,
  UserSelector,
  CurrentAppSelector,
  DevServerStateSelector
} = require("../../selectors");

class SelectorStep extends React.Component {
  render() {
    const { user, app, files, devState } = this.props;
    return (
      <div className={theme.files}>
        {files &&
          files.map(
            file =>
              file.uid &&
              <DevServerUpdate
                key={file.uid}
                actionData={{ state: devState }}
                file={file}
              >
                <SelectorFile file={file} />
              </DevServerUpdate>
          )}
        <Card className={theme.add}>
          <CardActions>
            <Prompt
              icon="add"
              promptInput="src/selectors/"
              label={getMessage("add.file")}
              dialogTitle={getMessage("file.path")}
              inputLabel={getMessage("file.path.label")}
              buttonLabel={getMessage("add.file")}
              onPromptEnter={promptInput =>
                this.props.addFile(user, app, promptInput)}
            />
          </CardActions>
        </Card>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: UserSelector(state),
    app: CurrentAppSelector(state),
    files: SelectorFilesSelector(state),
    devState: DevServerStateSelector(state)
  };
}

function mapsDispatchToProps(dispatch) {
  return {
    addFile: (user, app, path) =>
      dispatch(
        AppsActions.addFile(user.uid, app.uid, {
          path,
          module: "selectors",
          data: []
        })
      )
  };
}

module.exports = connect(mapStateToProps, mapsDispatchToProps)(SelectorStep);

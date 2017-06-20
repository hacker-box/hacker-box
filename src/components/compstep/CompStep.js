const React = require("react");
const { connect } = require("react-redux");
const CompFile = require("./CompFile");
const theme = require("./CompStep.css");
const { Card, CardActions } = require("react-toolbox");
const { Prompt } = require("../prompt");
const { getMessage } = require("../../common/utils/MessageUtil");
const { AppsActions } = require("../../actions");

const {
  CurrentAppSelector,
  CompFilesSelector,
  UserSelector
} = require("../../selectors");

class ReducerStep extends React.Component {
  render() {
    const { user, app, files } = this.props;
    return (
      <div className={theme.files}>
        {files &&
          files.map(
            file => file.uid && <CompFile key={file.uid} file={file} />
          )}
        <Card className={theme.add}>
          <CardActions>
            <Prompt
              icon="add"
              promptInput="components/"
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
    files: CompFilesSelector(state)
  };
}

function mapsDispatchToProps(dispatch) {
  return {
    addFile: (user, app, path) =>
      dispatch(
        AppsActions.addFile(user.uid, app.uid, {
          path,
          module: "components",
          data: []
        })
      )
  };
}

module.exports = connect(mapStateToProps, mapsDispatchToProps)(ReducerStep);

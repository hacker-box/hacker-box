const React = require("react");
const { connect } = require("react-redux");
const WebApiFile = require("./WebApiFile");
const theme = require("./WebApiStep.css");
const { AppsActions } = require("../../actions");
const { Prompt } = require("../prompt");
const { getMessage } = require("../../common/utils/MessageUtil");
const IndexFile = require("./IndexFile");

const {
  CurrentAppSelector,
  WebApiFilesSelector,
  FakerFilesSelector,
  UserSelector
} = require("../../selectors");
const { Card, CardActions, Checkbox } = require("react-toolbox");

class WebApiStep extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object
  };

  state = {
    createReducer: true,
    createAction: true
  };

  handleFakerServer = (file, path, fakerFile) => {
    const { user, app } = this.props;
    const { router } = this.context;

    if (fakerFile) {
      router.history.push(`/file/${fakerFile.uid}`);
      return;
    }
    this.props
      .addFile(user, app, path, "faker")
      .then(({ payload: file }) => router.history.push(`/file/${file.uid}`));
  };

  handleAddFile = path => {
    const { app, user } = this.props;
    const { createAction, createReducer } = this.state;
    const { router } = this.context;

    if (createAction) {
      this.props.addFile(
        user,
        app,
        path.replace("webapi", "actions"),
        "actions"
      );
    }
    if (createReducer) {
      this.props.addFile(
        user,
        app,
        path.replace("webapi", "reducers"),
        "reducers"
      );
    }

    this.props
      .addFile(user, app, path)
      .then(({ payload: file }) => router.history.push(`/file/${file.uid}`));
  };

  validate = (fileName) => {
    if (fileName.lastIndexOf(".js") !== fileName.length-3) {
      return getMessage('file.name.js')
    }
    const idxFile = "index.js";
    if (fileName.lastIndexOf(idxFile) === fileName.length-idxFile.length) {
      return getMessage('file.index.invalid');
    }
  }

  render() {
    const { files, fakerFiles } = this.props;
    const { createAction, createReducer } = this.state;
    return (
      <div className={theme.files}>
        {files &&
          files.map(
            file =>
              file.module.indexOf("Index") === -1 ?
              <WebApiFile
                key={file.uid}
                file={file}
                fakerFiles={fakerFiles}
                onFakerServer={this.handleFakerServer}
              />
              :
              <IndexFile
                key={file.uid}
                file={file}
                />
          )}
        <Card className={theme.add}>
          <CardActions>
            <Prompt
              icon="add"
              promptInput="src/webapi/"
              label={getMessage("add.file")}
              dialogTitle={getMessage("file.path")}
              inputLabel={getMessage("file.path.label")}
              buttonLabel={getMessage("add.file")}
              onPromptEnter={this.handleAddFile}
              validate={this.validate}
            >
              <Checkbox
                checked={createAction}
                label={getMessage("also.add.action.file")}
                onChange={() => this.setState({ createAction: !createAction })}
              />
              <Checkbox
                checked={createReducer}
                label={getMessage("also.add.reducer.file")}
                onChange={() =>
                  this.setState({ createReducer: !createReducer })}
              />
            </Prompt>
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
    files: WebApiFilesSelector(state),
    fakerFiles: FakerFilesSelector(state)
  };
}

function mapsDispatchToProps(dispatch) {
  return {
    addFile: (user, app, path, codeType) =>
      dispatch(
        AppsActions.addFile(user.uid, app.uid, {
          path,
          module: codeType || "webapi",
          data: []
        })
      )
  };
}

module.exports = connect(mapStateToProps, mapsDispatchToProps)(WebApiStep);

const React = require("react");
const { AppBar } = require("react-toolbox");
const { FileActions } = require("../components/fileeditor");
//const theme = require("./FileContainer.css");
const {
  FileEditor
} = require("../components/fileeditor");
const { connect } = require("react-redux");
const {
  CurrentAppSelector,
  UserSelector,
  AppFileIdsSelector
} = require("../selectors");
const { CurrentFileSelector } = require("../components/fileeditor/Selectors");
const { AppsActions } = require("../actions");
const { BarActions } = require("../components/baractions");

require("../plugins"); // registers plugins.

class FileContainer extends React.Component {
  componentWillMount = () => {
    const { app, user, match } = this.props;
    const { fileId } = match.params;

    if (app.uid) {
      return;
    }

    this.props.getUserApps(user).then(payload => {
      Promise.all(payload).then(apps => {
        const currApp = apps.find(
          app =>
            app.payload.files && Object.keys(app.payload.files).includes(fileId)
        );
        if (currApp) {
          this.props.setCurrent(currApp.payload.uid);
          this.props.getFiles(currApp.payload);
        }
      });
    });
  };

  handleBackClick = () => {
    const { history, app } = this.props;
    history.push(`/app/${app.uid}`);
  };

  render() {
    const { fileIds, match, app, file } = this.props;
    const { fileId } = match.params;

    return (
      <div>
        <AppBar
          title={`${app.meta ? app.meta.appName : ""}: ${file.path}`}
          leftIcon="arrow_back"
          onLeftIconClick={this.handleBackClick}
        >
          <BarActions />
        </AppBar>
        <FileEditor fileId={fileId} fileIds={fileIds} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: UserSelector(state),
    app: CurrentAppSelector(state),
    fileIds: AppFileIdsSelector(state),
    file: CurrentFileSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrent: appId => appId && dispatch(AppsActions.setCurrent(appId)),
    getUserApps: user =>
      dispatch(AppsActions.getUserApps(user.uid)).then(({ payload: appIds }) =>
        Object.keys(appIds).map(appId =>
          dispatch(AppsActions.getAppInfo(user.uid, appId)))),
    getFiles: app =>
      dispatch(FileActions.getFiles(app.uid, Object.keys(app.files || {})))
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(FileContainer);

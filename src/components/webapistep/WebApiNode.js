const React = require("react");
const { connect } = require("react-redux");
const { AppsActions } = require("../../actions");
const {
  CurrentWebApiSelector,
  CurrentAppSelector
} = require("../../selectors");

class WebApiNode extends React.Component {
  handleOnClick = () => {
    const { app, node, editor } = this.props;
    editor.onChange(editor.getState().transform().deselect().apply());
    setTimeout(
      () => this.props.setCurrentApi(app.uid, node.data.get("uid")),
      0
    );
  };

  render() {
    const { node, webapi, children } = this.props;
    const { verb, url, uid, functionName } = node.data.toJS();

    if (!webapi || webapi.uid !== uid) {
      return (
        <div onClick={this.handleOnClick}>
          {functionName} {verb} {url}
        </div>
      );
    }

    return (
      <div>
        <pre>
          {children}
        </pre>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  app: CurrentAppSelector(state),
  webapi: CurrentWebApiSelector(state)
});

const mapDispatchToProps = dispatch => ({
  setCurrentApi: (appId, id) =>
    dispatch(
      AppsActions.setCurrentModule({
        appId,
        id: id,
        type: "webapi"
      })
    )
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(WebApiNode);

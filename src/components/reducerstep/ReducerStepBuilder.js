const React = require("react");
const { connect } = require("react-redux");
const { AppsActions } = require("../../actions");
const { getMessage } = require("../../common/utils/MessageUtil");
const { CodeSlate, deserialize } = require("../../common/components/codeslate");
const _get = require("lodash.get");
const {
  Card,
  CardTitle,
  CardText,
  CardActions,
  Button
} = require("react-toolbox");
const {
  CurrentAppSelector
} = require("../../selectors");

class ReducerStepBuilder extends React.Component {
  componentWillReceiveProps = props => {
    const { reducer } = props;
    if (!reducer.current) {
      return;
    }

    if (!reducer.state) {
      this.handleCodeChange(deserialize(reducer.editor));
    }
  };

  handleCodeChange = editorState => {
    const { app, reducer } = this.props;

    this.props.setApiState({
      appId: app.uid,
      id: reducer.uid,
      type: "reducers",
      editorState
    });
  };

  render() {
    const { app, user, reducer } = this.props;

    if (!reducer.current) {
      return (
        <div onClick={() => this.props.setCurrentModule(app.uid, reducer.uid)}>
          {reducer.uid}
        </div>
      );
    }

    return (
      <Card>
        <CardTitle
          title={getMessage("reducer.title")}
          subtitle={getMessage("reducer.subtitle")}
        />
        <CardText>
          {reducer.state &&
            <CodeSlate
              editorState={reducer.state}
              placeholder={getMessage("reducer.placeholder")}
              onChange={this.handleCodeChange}
            />}
        </CardText>
        <CardActions>
          <Button
            raised
            primary
            label={getMessage("label.done")}
            onClick={() =>
              this.props.handleReducerDone(
                user.uid,
                app.uid,
                reducer,
                app.relations
              )}
          />
        </CardActions>
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    app: CurrentAppSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setApiState: payload => dispatch(AppsActions.setApiState(payload)),
    setCurrentModule: (appId, id) =>
      dispatch(AppsActions.setCurrentModule({ appId, id, type: "reducers" }))
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(
  ReducerStepBuilder
);

const React = require("react");
const { connect } = require("react-redux");
const { AppsActions } = require("../../actions");
const { getRelatedByType, ModuleTypes } = require("../../utils/Relations");
const { getMessage } = require("../../common/utils/MessageUtil");
const { runCommandCreator } = require("../terminal");
const { getActionName, getActionClientCode } = require("./ActionUtils");

const {
  CodeSlate,
  deserialize,
  getCode,
  getCodeFromRaw
} = require("../../common/components/codeslate");

const {
  Card,
  CardTitle,
  CardText,
  CardActions,
  Button
} = require("react-toolbox");

const _get = require("lodash.get");
const {
  CurrentAppSelector,
  UserSelector
} = require("../../selectors");

class ActionStepBuilder extends React.Component {
  componentWillReceiveProps = props => {
    const { action } = props;

    if (!action.current) {
      return;
    }

    if (!action.state) {
      this.handleCodeChange(deserialize(action.editor));
    }
  };

  handleCodeChange = editorState => {
    const { app, action } = this.props;

    this.props.setApiState({
      appId: app.uid,
      id: action.uid,
      type: "actions",
      editorState
    });
  };

  render() {
    const { app, user, action } = this.props;

    if (!action.current) {
      return (
        <div onClick={() => this.props.setCurrentModule(app.uid, action.uid)}>
          {action.uid}
        </div>
      );
    }

    return (
      <Card>
        <CardTitle
          title={getMessage("action.title")}
          subtitle={getMessage("action.subtitle")}
        />
        <CardText>
          {action.state &&
            <CodeSlate
              editorState={action.state}
              placeholder={getMessage("action.placeholder")}
              onChange={this.handleCodeChange}
            />}
        </CardText>
        <CardActions>
          <Button
            raised
            label={getMessage("action.trigger")}
            onClick={() => this.props.triggerAction(user.uid, app, action)}
          />
          <Button
            raised
            primary
            label={getMessage("label.done")}
            onClick={() =>
              this.props.handleActionDone(
                user.uid,
                app.uid,
                action,
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
    user: UserSelector(state),
    app: CurrentAppSelector(state)
  };
}

const getEditorStateCode = ({ state, editor }) =>
  state ? getCode(state) : getCodeFromRaw(editor) || "";

const triggerActionCreator = dispatch =>
  (userId, app, action) => {
    const { relations, webapi, reducers, uid: appId } = app;
    const runCommand = runCommandCreator(dispatch);
    const api = getRelatedByType(
      relations,
      action.uid,
      ModuleTypes.WEBAPI
    ).shift();
    const reducer = getRelatedByType(
      relations,
      action.uid,
      ModuleTypes.REDUCER
    ).shift();
    if (!api || !reducer) {
      throw new Error("No api or reducer code found for action", action.uid);
    }

    const actionCode = getEditorStateCode(action);
    const actionName = getActionName(actionCode);

    [
      {
        content: actionCode,
        command: `writeFile src/actions/${actionName}.js`
      },
      {
        content: getEditorStateCode(reducers[reducer.uid]),
        command: `writeFile src/reducers/${actionName}.js`
      },
      {
        content: getEditorStateCode(webapi[api.uid].client),
        command: `writeFile src/webapi/${actionName}.js`
      },
      {
        content: getEditorStateCode(webapi[api.uid].server),
        command: `writeFile server/api/faker/${actionName}.js`
      },
      {
        content: getActionClientCode(actionName),
        command: `writeFile src/client/deleteme/${actionName}.js`
      },
      {
        content: `require("./client/deleteme/${actionName}")`,
        command: "writeFile src/client.js"
      }
    ].map(({ content, command }) =>
      runCommand({ userId, appId, content, command }));
  };

function mapDispatchToProps(dispatch) {
  return {
    setApiState: payload => dispatch(AppsActions.setApiState(payload)),
    triggerAction: triggerActionCreator(dispatch),
    setCurrentModule: (appId, id) =>
      dispatch(AppsActions.setCurrentModule({ appId, id, type: "actions" }))
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(
  ActionStepBuilder
);

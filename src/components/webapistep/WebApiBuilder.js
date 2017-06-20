const React = require("react");
const { connect } = require("react-redux");
const {
  CodeSlate,
  deserialize,
  getCode
} = require("../../common/components/codeslate");
const { getMessage } = require("../../common/utils/MessageUtil");
const theme = require("./WebApiBuilder.css");
const { AppsActions } = require("../../actions");
const {
  getRelation,
  ModuleTypes,
  getRelationById
} = require("../../utils/Relations");

const _get = require("lodash.get");
const {
  UserSelector,
  CurrentAppSelector,
  WebApiSelector,
  FakersSelector
} = require("../../selectors");
const {
  Card,
  CardTitle,
  CardText,
  CardActions,
  Button
} = require("react-toolbox");

const capture = /(faker\.[^\s(]*)/;

class WebApiBuilder extends React.Component {
  state = {};

  componentWillReceiveProps = props => {
    const { api } = props;
    const { client, server } = api;
    const { suggestions } = this.state;

    if (!api.current) {
      return;
    }

    if (!client.state) {
      this.handleClientCodeChange(deserialize(client.editor));
    }

    if (!server.state) {
      this.handleServerCodeChange(deserialize(server.editor));
    }

    if (!suggestions && props.fakers && props.fakers.length > 0) {
      this.setState({
        suggestions: {
          capture,
          suggestions: props.fakers,
          onEnter: this.handleSuggestEnter
        }
      });
    }
  };

  handleSuggestEnter = suggestion => {
    return this.props.api.server.state;
  };

  handleGencodeClick = () => {
    const { api, appId } = this.props;
    const text = getCode(api.server.state);
    try {
      this.props.getCodeForJSON(appId, api.uid, JSON.parse(text));
      return true;
    } catch (ex) {
      console.error(ex);
      // TODO: send error action.
    }
  };

  handleCodeChange = (editorKey, editorState) => {
    const { appId, api } = this.props;
    const id = api.uid;

    this.props.setApiState({
      appId,
      id,
      type: "webapi",
      editorKey,
      editorState
    });
  };

  handleClientCodeChange = editorState =>
    this.handleCodeChange("client", editorState);
  handleServerCodeChange = editorState =>
    this.handleCodeChange("server", editorState);

  render() {
    const { user, appId, api, app } = this.props;
    const { server, client } = api;
    const { relations } = app;

    if (!api.current) {
      return (
        <div onClick={() => this.props.setCurrentModule(appId, api.uid)}>
          {api.uid}
        </div>
      );
    }

    return (
      <Card>
        <CardTitle
          title={getMessage("webapi.title")}
          subtitle={getMessage("webapi.subtitle")}
        />
        <CardText>
          <div className={theme.editorWrapper}>
            {client.state &&
              <CodeSlate
                editorState={client.state}
                placeholder={getMessage("webapi.client.placeholder")}
                onChange={this.handleClientCodeChange}
              />}
          </div>
          <div className={theme.editorWrapper}>
            {server.state &&
              <CodeSlate
                editorState={server.state}
                placeholder={getMessage("webapi.server.placeholder")}
                onChange={this.handleServerCodeChange}
              />}
          </div>
        </CardText>
        <CardActions>
          <Button
            raised
            label={getMessage("webapi.2code")}
            onClick={this.handleGencodeClick}
          />
          <Button
            raised
            primary
            label={getMessage("label.done")}
            onClick={() =>
              this.props.handleApiDone(user.uid, appId, api, relations)}
          />
        </CardActions>
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: UserSelector(state),
    app: CurrentAppSelector(state),
    webapi: WebApiSelector(state),
    fakers: FakersSelector(state)
  };
}

const handleApiDoneCreator = dispatch =>
  (userId, appId, api, relations) => {
    // Close api card
    dispatch(
      AppsActions.setCurrentModule({
        appId,
        id: null,
        type: "webapi"
      })
    );

    const relationId = getRelationById(relations, api.uid);
    const actions = getRelation(relations, relationId, ModuleTypes.ACTION);
    const reducers = getRelation(relations, relationId, ModuleTypes.REDUCER);

    if (actions.length === 0) {
      dispatch(AppsActions.addAction(userId, appId, { api })).then(({
        payload: action
      }) => {
        const knots = [
          { uid: api.uid, type: ModuleTypes.WEBAPI, relationId: relationId },
          { uid: action.uid, type: ModuleTypes.ACTION, relationId: relationId }
        ];
        dispatch(AppsActions.setRelations(userId, appId, knots));
      });
    }
    if (reducers.length === 0) {
      dispatch(AppsActions.addReducer(userId, appId, { api })).then(({
        payload: reducer
      }) => {
        const knots = [
          { uid: api.uid, type: ModuleTypes.WEBAPI, relationId: relationId },
          {
            uid: reducer.uid,
            type: ModuleTypes.REDUCER,
            relationId: relationId
          }
        ];
        dispatch(AppsActions.setRelations(userId, appId, knots));
      });
    }
  };

function mapDispatchToProps(dispatch) {
  return {
    setCurrentModule: (appId, id) =>
      dispatch(AppsActions.setCurrentModule({ appId, id, type: "webapi" })),
    setApiState: payload => dispatch(AppsActions.setApiState(payload)),
    getCodeForJSON: (appId, apiId, jsonObj) =>
      dispatch(AppsActions.getCodeForJson({ appId, apiId, jsonObj })),
    handleApiDone: handleApiDoneCreator(dispatch)
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(WebApiBuilder);

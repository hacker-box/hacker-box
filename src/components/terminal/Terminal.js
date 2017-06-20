const React = require("react");
const ReactDOM = require("react-dom");
const Actions = require("./Actions");
const { Input, ProgressBar, Button } = require("react-toolbox");
const { connect } = require("react-redux");
const _isEqual = require("lodash.isequal");
const classnames = require("classnames");
const keycode = require("keycode");
const {
  TaskListSelector,
  CurrentAppIdSelector,
  AppDataSelector
} = require("./Selectors");
const theme = require("./theme.css");
const { runCommandCreator } = require("./runCommand");

class Terminal extends React.Component {
  state = {
    command: ""
  };

  componentWillReceiveProps = props => {
    const { app, appData } = props;
    if (app && app.uid && app.uid !== this.props.currentAppId) {
      this.props.setCurrentTerminal(this.props.app.uid);
    }
    if (!_isEqual(appData, this.props.appData) && props.onAppData) {
      props.onAppData(props.appData);
    }
  };

  componentDidUpdate = () => {
    if (this.input && this.state.maxHeight) {
      this.input.getWrappedInstance().focus();
    }
    if (this.bottomAchor) {
      ReactDOM.findDOMNode(this.bottomAchor).scrollIntoView();
    }
  };

  componentWillMount = () =>
    this.props.getActiveCommands(this.props.user.uid, this.props.currentAppId);

  handleKeyPress = event => {
    if (keycode(event) !== "enter") {
      return;
    }
    const { user, currentAppId } = this.props;
    this.props.runCommand({
      userId: user.uid,
      appId: currentAppId,
      command: event.target.value
    });
    this.setState({ command: "" });
  };

  handleStop = ({ id }) => {
    const { user, currentAppId } = this.props;
    this.props.taskStopped({appId: currentAppId, taskId: id});
    this.props.runCommand({
      userId: user.uid,
      appId: currentAppId,
      command: `stop ${id}`
    });
  };

  handleChange = value => this.setState({ command: value || "" });

  scrollToBottom = () =>
    this.bottomAchor &&
    setTimeout(
      () => ReactDOM.findDOMNode(this.bottomAchor).scrollIntoView(),
      500
    );

  focus = () => this.input.getWrappedInstance().focus();

  render() {
    const { tasks, className } = this.props;
    const { command } = this.state;
    const terminalClass = classnames(className, theme.terminal);

    return (
      <div className={terminalClass}>
        {tasks.map((task, idx) => (
          <div key={idx}>
            <code>% {task.command}</code>
            {Array.isArray(task.logs) &&
              task.logs.map((log, lidx) => (
                <div key={lidx} className={theme[`log${log.action}`]}>
                  <pre>{log.msg || log.err}</pre>
                </div>
              ))}
            {(!task.status || task.status === "data") &&
              <div className={theme.progress}>
                <ProgressBar mode="indeterminate" multicolor />
                <Button
                  label="Stop"
                  inverse
                  onClick={this.handleStop.bind(this, task)}
                />
              </div>}
          </div>
        ))}
        <Input
          ref={inp => this.input = inp}
          theme={theme}
          value={command}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
        />
        <div ref={ba => this.bottomAchor = ba} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tasks: TaskListSelector(state),
    currentAppId: CurrentAppIdSelector(state),
    appData: AppDataSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrentTerminal: appId => dispatch(Actions.setCurrentTerminal(appId)),
    runCommand: runCommandCreator(dispatch),
    taskStopped: payload => dispatch(Actions.taskStopped(payload)),
    getActiveCommands: (userId, appId) =>
      dispatch(
        Actions.getActiveCommands(
          { userId, appId },
          {
            onTask: (task, logs) => {
              dispatch(Actions.addCommand(task));
              logs.map(log => dispatch(Actions.commandOutput(log)));
            },
            onData: log => dispatch(Actions.commandOutput(log))
          }
        )
      )
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps, null, {
  withRef: true
})(Terminal);

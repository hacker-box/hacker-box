const React = require("react");
const theme = require("./theme.css");
const { Terminal } = require("../terminal");
const { connect } = require("react-redux");
const { AppsActions } = require("../../actions");
const { Snackbar } = require("react-toolbox");
const classnames = require("classnames");
const StatusBar = require("./StatusBar");

const {
  CurrentAppSelector,
  UserSelector,
  AppDataSelector,
  CommandOpenSelector,
  CliSelector
} = require("../../selectors");

class CmdBar extends React.Component {
  componentDidMount = () => this.terminal && this.terminal.scrollToBottom();

  handleMouseEnter = () => {
    this.tm = setTimeout(
      () => {
        this.props.toggleCommand(true);
        if (this.terminal) {
          this.terminal.scrollToBottom();
          this.terminal.focus();
        }
      },
      300
    );
  };

  handleMouseLeave = () => {
    clearTimeout(this.tm);
    this.props.toggleCommand(false);
    this.setState({ maxHeight: false });
    if (this.terminal) {
      this.terminal.scrollToBottom();
    }
  };

  render() {
    const { app, user, className, open, cli } = this.props;

    const barClass = classnames(className, theme.cmdbar, {
      [theme.maxHeight]: open
    });

    return (
      <Snackbar
        active={true}
        className={theme.snack}
        theme={theme}
        type="cancel"
        label={
          <StatusBar
            app={app}
            user={user}
            toggleCommand={open => this.props.toggleCommand(open)}
          />
        }
      >
        {cli &&
          <div
            className={barClass}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          >
            <Terminal
              app={app}
              user={user}
              ref={term => this.terminal = term && term.getWrappedInstance()}
              onAppData={appData => this.props.setAppData(app.uid, appData)}
            />
          </div>}
      </Snackbar>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: UserSelector(state),
    app: CurrentAppSelector(state),
    appData: AppDataSelector(state),
    open: CommandOpenSelector(state),
    cli: CliSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAppData: (appId, appData) =>
      dispatch(AppsActions.setAppData({ appId, appData })),
    toggleCommand: open => dispatch(AppsActions.toggleCommand(open))
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(CmdBar);

const React = require("react");
const { connect } = require("react-redux");
const {
  getMessage,
  getFormatMessage
} = require("../../common/utils/MessageUtil");
const { UserActions } = require("../../actions");
const { Prompt } = require("../prompt");
const { Dialog, Button, IconButton } = require("react-toolbox");
const {
  PasscodeSelector,
  CliSelector,
  HboxAppData,
  CurrentAppContent,
  CommandOpenSelector
} = require("../../selectors");
const theme = require("./theme.css");
const { runCommandSyncCreator, runCommandCreator } = require("../terminal");
const { getLastWriteData } = require("../../common/utils/Helpers");

class StatusBar extends React.Component {
  state = {
    dirChanged: false
  };

  actions = [
    { label: getMessage("label.cancel"), onClick: this.props.resetPin }
  ];

  componentWillReceiveProps = props => {
    const { cli, app, passcode, appRoot, user } = props;
    const { dirChanged } = this.state;

    if (passcode && cli) {
      this.props.resetPin();
    }

    if (!app.uid) {
      return;
    }

    if (cli && appRoot && !dirChanged) {
      this.setState({ dirChanged: true });
      this.props.changeDir(user.uid, app.uid, appRoot);
    }
  };

  handleCheckoutApp = dir => {
    const { user, app, cli, appContent } = this.props;
    this.props.toggleCommand(true);
    this.props.checkoutApp(user, app.uid, dir, appContent, cli, user.settings);
  };

  render() {
    const {
      app,
      appRoot,
      cli,
      passcode,
      open
    } = this.props;

    if (cli) {
      return (
        <div className={theme.connected}>
          <div className={theme.status}>[ {cli.hostname} ]</div>
          <div>
            {app.uid &&
              !appRoot &&
              <Prompt
                inverse
                promptInput={cli.cwd}
                label={getMessage("app.checkout")}
                dialogTitle={getMessage("app.checkout.title")}
                inputLabel={getMessage("app.checkout.label")}
                buttonLabel={getMessage("app.checkout")}
                onPromptEnter={this.handleCheckoutApp}
              />}
          </div>
          <IconButton
            icon={open ? "arrow_downward" : "arrow_upward"}
            inverse
            onClick={() => this.props.toggleCommand(!open)}
          />

        </div>
      );
    }

    return (
      <div className={theme.disconnected}>
        <div className={theme.status}>{getMessage("cli.disconnected")}</div>
        <Button
          inverse
          label={getMessage("generate.cli.pin")}
          onClick={this.props.generateCliPin}
        />
        <Dialog
          actions={this.actions}
          active={!!passcode}
          onEscKeyDown={this.props.resetPin}
          onOverlayClick={this.props.resetPin}
          title={getMessage("cli.title")}
        >
          <h4>{getMessage("cli.description")}</h4>
          <code>
            {getMessage("cli.install")}
          </code>
          <h4>{getMessage("cli.run")}</h4>
          <code>{getFormatMessage("cli.run.command", [passcode])}</code>
          <pre>
            <i className={theme.note}>
              Note: This feature is experimental and tested mostly on Mac.
            </i>
          </pre>
        </Dialog>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    passcode: PasscodeSelector(state),
    cli: CliSelector(state),
    appRoot: HboxAppData(state).root,
    appContent: CurrentAppContent(state),
    open: CommandOpenSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  const runCommand = runCommandCreator(dispatch);
  return {
    generateCliPin: () =>
      dispatch(UserActions.getFirebaseToken()).then(({ payload: token }) =>
        dispatch(UserActions.getPasswordPin(token))),
    resetPin: () => dispatch(UserActions.resetPin()),
    changeDir: (userId, appId, dir) =>
      runCommand({ userId, appId, command: `cd ${dir}` }),
    checkoutApp: (user, appId, dir, appContent, cli) => {
      const userId = user.uid;
      const { baseAppCloneCommands } = user.settings;
      const hboxFiles = getLastWriteData(appContent, {});
      const hbox = {
        ...cli.hbox,
        ...{
          apps: {
            ...(cli.hbox.apps || {}),
            [appId]: { root: dir, files: hboxFiles }
          }
        }
      };
      let err = false;
      return runCommandSyncCreator(dispatch, {
        onDone: () =>
          !err && dispatch(UserActions.setCliData(userId, cli.uid, hbox)),
        onError: () => err = true
      })(
        [
          { userId, appId, command: `mkdir -p ${dir}` },
          { userId, appId, command: `cd ${dir}` }
        ].concat(
          baseAppCloneCommands.map(command => ({ userId, appId, command })),
          {
            userId,
            appId,
            command: `writeFileBulk ${dir}`,
            content: appContent
          },
          { userId, appId, command: "yarn install" }
        )
      );
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(StatusBar);

const React = require("react");
const {
  Button,
  Tooltip,
  Dialog,
  Input
} = require("react-toolbox");
const TooltipButton = Tooltip(Button);
const keycode = require("keycode");
const { getMessage } = require("../../common/utils/MessageUtil");

class Prompt extends React.Component {
  state = {
    showPrompt: false,
    promptErr: false,
    promptErrMsg: getMessage("prompt.empty"),
    promptInput: "",
    defaultPromptInput: ""
  };

  handlePrompt = () => {
    const { validate } = this.props;
    const { promptInput } = this.state;
    if (!promptInput || !promptInput.trim()) {
      this.setState({
        promptErr: true,
        promptInput: "",
        promptErrMsg: getMessage("prompt.empty")
      });
      return;
    }
    const promptErrMsg = validate && validate(promptInput);
    if (promptErrMsg) {
      this.setState({ promptErr: true, promptErrMsg });
      return;
    }
    this.hidePrompt();
    this.props.onPromptEnter(promptInput);
  };

  hidePrompt = () => this.setState({ showPrompt: false });

  showPrompt = () =>
    this.setState({
      showPrompt: true,
      promptInput: this.state.defaultPromptInput,
      promptErr: false
    });

  handleInputChange = promptInput => {
    this.setState({
      promptInput,
      promptErr: !promptInput
    });
  };

  componentWillMount = () => {
    const { promptInput } = this.props;
    if (!promptInput) {
      return;
    }
    this.setState({
      promptInput,
      defaultPromptInput: promptInput
    });
  };

  componentDidUpdate = () =>
    this.state.showPrompt &&
    this.input &&
    this.input.getWrappedInstance().focus();

  render() {
    const {
      dialogTitle,
      inputLabel,
      buttonLabel,
      tooltip,
      onPromptEnter, // eslint-disable-line
      promptInput: defaultPromptInput, // eslint-disable-line
      validate, // eslint-disable-line
      children,
      ...rest
    } = this.props;
    const { showPrompt, promptErr, promptErrMsg, promptInput } = this.state;
    const errorMsg = promptErr && <span>{promptErrMsg}</span>;
    const actions = [
      { label: getMessage("label.cancel"), onClick: () => this.hidePrompt() },
      {
        label: buttonLabel,
        primary: true,
        onClick: () => this.handlePrompt()
      }
    ];

    return (
      <div>
        {tooltip
          ? <TooltipButton
              onClick={this.showPrompt}
              tooltip={tooltip}
              {...rest}
            />
          : <Button onClick={this.showPrompt} {...rest} />}
        <Dialog
          actions={actions}
          active={showPrompt}
          onEscKeyDown={this.hidePrompt}
          onOverlayClick={this.hidePrompt}
          title={dialogTitle}
        >
          <Input
            type="text"
            label={inputLabel}
            value={promptInput}
            ref={inp => this.input = inp}
            error={errorMsg}
            onChange={this.handleInputChange}
            spellCheck="false"
            onKeyPress={ev => keycode(ev) === "enter" && this.handlePrompt()}
          />
          {children}
        </Dialog>
      </div>
    );
  }
}

module.exports = Prompt;

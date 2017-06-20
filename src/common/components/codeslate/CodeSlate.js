const React = require("react");
const { Editor, Plain } = require("slate");
const Suggestions = require("slate-suggestions").default;
const _isEqual = require("lodash.isequal");
const theme = require("./theme.css");

class CodeSlate extends React.Component {
  state = {
    plugins: []
  };

  setSuggestions = suggestions => {
    if (!suggestions) {
      return;
    }
    const { plugins } = this.state;
    const SuggestionsPlugin = Suggestions(suggestions);
    const { SuggestionPortal } = SuggestionsPlugin;
    if (plugins.length > 1) {
      plugins.pop();
    }
    plugins.push(SuggestionsPlugin);
    this.setState({ plugins, SuggestionPortal });
  };

  componentWillMount = () => this.setSuggestions(this.props.suggestions);

  componentWillReceiveProps = props => {
    const { suggestions } = props;
    if (_isEqual(suggestions, this.props.suggestions)) {
      return;
    }
    this.setSuggestions(suggestions);
  };

  getCode = () => Plain.serialize(this.props.editorState);

  render() {
    const { SuggestionPortal, plugins } = this.state;
    const { placeholder, editorState } = this.props;
    return (
      <div>
        <Editor
          className={theme.editor}
          placeholder={placeholder}
          placeholderClassName={theme.placeholder}
          plugins={
            this.props.plugins ? this.props.plugins.concat(plugins) : plugins
          }
          state={editorState}
          spellCheck={false}
          onChange={this.props.onChange}
        />
        {SuggestionPortal && <SuggestionPortal state={editorState} />}
      </div>
    );
  }
}

module.exports = CodeSlate;

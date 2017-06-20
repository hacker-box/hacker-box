const schema = require("./CodeSchema");
const { saveReducer } = require("./CodeEventHandlers");

const onKeyDown = ({ setEditorState }) =>
  (event, data, state) => {
    const block = state.startBlock;
    if (
      !block ||
      (block.get("type") !== "reducer" &&
        block.get("type") !== "reducer_function")
    ) {
      return;
    }
    if (data.key === "s" && data.isMod) {
      event.preventDefault();
      saveReducer({ block, data, state }, setEditorState);
    }
    return;
  };

function codePlugin(options) {
  return {
    onKeyDown: onKeyDown(options),
    schema
  };
}

module.exports = codePlugin;

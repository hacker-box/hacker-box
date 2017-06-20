const schema = require("./CodeSchema");
const { saveAction } = require("./CodeEventHandlers");

const onKeyDown = ({ setEditorState }) =>
  (event, data, state) => {
    const block = state.startBlock;
    if (!block || block.get("type") !== "action") {
      return;
    }
    if (data.key === "s" && data.isMod) {
      event.preventDefault();
      saveAction({ block, data, state }, setEditorState);
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

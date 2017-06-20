const schema = require("./CodeSchema");
const { saveWebApi } = require("./CodeEventHandlers");

const onKeyDown = ({ setEditorState }) =>
  (event, data, state) => {
    const block = state.startBlock;
    if (!block || block.get("type") !== "webapi") {
      return;
    }
    if (data.key === "s" && data.isMod) {
      event.preventDefault();
      saveWebApi({ block, data, state }, setEditorState);
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

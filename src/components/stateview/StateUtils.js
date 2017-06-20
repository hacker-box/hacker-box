const { createCodeBlock } = require("../../common/components/codeslate");
const { getCode, code2State } = require("../../common/components/codeslate");

const stateCode = `
{
  "messages": {
    "app.title": "MyApp"
  }
}
`;

function mergeState(editorState, newState) {
  const currentState = JSON.parse(getCode(editorState));
  const state = { ...currentState, ...newState };
  return code2State(JSON.stringify(state, null, 2));
}

module.exports = {
  mergeState,
  createStateCode: () => createCodeBlock(stateCode)
};

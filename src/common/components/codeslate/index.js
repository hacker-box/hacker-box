const CodeSlate = require("./CodeSlate");
const createCodeBlock = require("./CreateCodeBlock");
const { Raw, Plain } = require("slate");

const deserialize = raw => Raw.deserialize(JSON.parse(raw), { terse: true });
const serialize = state =>
  JSON.stringify(Raw.serialize(state, { terse: true }));

const getCode = state => Plain.serialize(state);
const getCodeFromRaw = raw => Plain.serialize(deserialize(raw));
const code2State = code => Plain.deserialize(code);

// Newline block
const newText = (text) =>
  Raw.deserializeText({ kind: "text", ranges: [{ kind: "range", text, marks: [] }] });

module.exports = {
  CodeSlate,
  serialize,
  deserialize,
  getCode,
  getCodeFromRaw,
  createCodeBlock,
  code2State,
  newText
};

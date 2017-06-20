const {
  getDataFromCode,
  getCodeFromData,
  newFileContent
} = require("../../plugins/plugin");
const { Raw } = require("slate");
const { getDiffs } = require("../../plugins/helpers");
const { parseJson } = require("../../common/utils/Helpers");
const { getPrettierCode } = require("../../webapi");
const babylon = require("babylon");
const { default: traverse } = require("babel-traverse");
import { List } from "immutable";

const commentRegEx = /\/\*([\s\S]*?)\*\//g;

function createCodeBlock(code, data) {
  const lines = code
    .split(commentRegEx)
    .reduce(
      (cLines, cc, idx) =>
        cc === ""
          ? cLines
          : cLines.concat(idx % 2 ? `/*${cc}*/` : cc.split("\n")),
      []
    );

  return {
    data,
    nodes: [
      {
        kind: "block",
        type: "code_block",
        nodes: lines.map(line => ({
          kind: "block",
          type: "code_line",
          nodes: [
            {
              kind: "text",
              ranges: [
                {
                  text: line
                }
              ]
            }
          ]
        }))
      }
    ]
  };
}

function createLineBlocks(code) {
  const lines = code ? code.split("\n") : [];
  return lines.map(line =>
    Raw.deserializeNode(
      {
        kind: "block",
        type: "code_line",
        nodes: [
          {
            kind: "text",
            ranges: [
              {
                text: line
              }
            ]
          }
        ]
      },
      { terse: true }
    ));
}

const createCodeState = (code, data) =>
  Raw.deserialize(createCodeBlock(code, data), { terse: true });

const getTextFromState = editorState =>
  editorState.document.nodes
    .map(block => block.nodes.map(node => node.text).join("\n"))
    .join("\n");

function getDataActions(file) {
  const { codeState, module: codeType, data } = file;
  const currData = data || [];
  const dataFromCode = getDataFromCode(codeType, getTextFromState(codeState));
  const diffs = getDiffs(currData, dataFromCode);
  return diffs;
}

function patchCodeFromData(file) {
  const { codeState, dataState, module: codeType, data } = file;
  if (!dataState) {
    return Promise.resolve(codeState);
  }
  const currData = data || [];
  const editedData = parseJson(getTextFromState(dataState));
  const diffs = getDiffs(currData, editedData);
  if (diffs.length === 0) {
    return Promise.resolve(codeState);
  }
  console.log("diffs", diffs);
  const patchedCode = getCodeFromData(
    codeType,
    getTextFromState(codeState),
    diffs,
    currData,
    editedData
  );
  return getPrettierCode(patchedCode).then(res => createCodeState(res.text));
}

function getNewFileContent(codeType) {
  const newFileCode = newFileContent(codeType) || {};
  const modNew = newFileCode[codeType];
  return createCodeState(modNew && modNew.src ? modNew.src : "");
}

function getDataDoc(codeType) {
  const newFileCode = newFileContent(codeType) || {};
  const modNew = newFileCode[codeType];
  return modNew && modNew.doc ? modNew.doc : "";
}

function addDocToData(doc, data) {
  //const commentedDoc = doc.replace(/\n/g, "\n//\t");
  return `/*${doc}\n*/\n${data}`;
}

function getDataState(codeType, jsObj) {
  const code = addDocToData(getDataDoc(codeType), JSON.stringify(jsObj));
  return getPrettierCode(code).then(res =>
    createCodeState(res.text, { codeType }));
}

function getDataStateSync(codeType, jsObj) {
  const code = addDocToData(
    getDataDoc(codeType),
    JSON.stringify(jsObj, null, 2)
  );
  return createCodeState(code, { codeType });
}

function applySuggestionToData(file, suggestion) {
  const data = file.dataState
    ? parseJson(getTextFromState(file.dataState))
    : file.data;
  if (suggestion.action && typeof suggestion.action === "function") {
    return getDataState(file.module, suggestion.action(data));
  }
  return Promise.reject(
    `No "action" function found for suggestion ${suggestion.caption}`
  );
}

const parser = (function() {
  let lastCode = null;
  let lastAst = null;
  return function(code) {
    if (lastCode !== code) {
      lastAst = babylon.parse(code, { sourceType: "module" });
    }
    lastCode = code;
    return lastAst;
  };
})();

function getStartEnd(text, offset) {
  const ast = parser(text);
  let start = offset, end = offset;
  traverse(ast, {
    ObjectExpression: {
      enter({ node }) {
        if (node.start <= offset && node.end > offset) {
          start = node.start;
          end = node.end;
        }
      }
    },
    StringLiteral: {
      enter(path) {
        if (path.node.start <= offset && path.node.end > offset) {
          let parentPath = path.parentPath;
          while (parentPath) {
            if (parentPath.isObjectExpression()) {
              return;
            } else if (parentPath.isArrayExpression()) {
              start = path.node.start;
              end = path.node.end;
            }
            parentPath = parentPath.parentPath;
          }
        }
      }
    }
  });
  return { start, end };
}

function getMarkerStartEnd(texts, markType) {
  const chars = texts.reduce(
    (chars, text) => chars.concat(text.characters, "\n"),
    new List()
  );
  const start = chars.findIndex(
    char => char.marks && char.marks.find(mark => mark.get("type") === markType)
  );
  const end = chars.findLastIndex(
    char => char.marks && char.marks.find(mark => mark.get("type") === markType)
  ) + 1;

  return { start, end };
}

module.exports = {
  getDataActions,
  createCodeBlock,
  createCodeState,
  patchCodeFromData,
  getNewFileContent,
  getDataState,
  getDataStateSync,
  getDataDoc,
  applySuggestionToData,
  getStartEnd,
  createLineBlocks,
  getMarkerStartEnd,
  getTextFromState
};

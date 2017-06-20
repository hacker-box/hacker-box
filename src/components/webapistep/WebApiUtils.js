const _camelCase = require("lodash.camelcase");
const {
  getCode,
  createCodeBlock,
  newText
} = require("../../common/components/codeslate");
const { Raw } = require("slate");

const webapiClientCode = `
const getSomething = (someId) => request.get(\`/api/something/\${someId}\`).type('json').accept('json');
module.exports = {
  getSomething
}
`;

const webapiClientFile = `
const request = require('superagent');

module.exports = {};
`;

const serverCode = "";

const verbUrl = /\.(get|post|del|delete|put|head|patch)\s*\(\s*["'`]([^"'`]*)["'`]\s*\)/;
const reverseCamelCase = /([A-Z])/g;

function getApiFunctionName(code) {
  const [, verb, url] = code.match(verbUrl);
  // Filter ${}, Ignore /api, Use first two
  const urlArr = url
    .split("/")
    .filter(path => path.indexOf("$") === -1)
    .splice(2, 3);
  return _camelCase([verb, ...urlArr].join("_"));
}

function extractActionType({ api }) {
  const clientCode = getCode(api.client.state);
  const apiName = getApiFunctionName(clientCode);
  return {
    apiName,
    actionType: apiName.replace(reverseCamelCase, "_$1").toUpperCase()
  };
}

const emptySemi = /^\s*;\s*$/;
function filterImpExp(blk) {
  const type = blk.get("type");
  const txt = blk.getText();
  if (type === "export_decs" || type === "import_dec") {
    return false;
  }
  if (txt.match(emptySemi)) {
    return false;
  }
  return true;
}

function addWebapiTransform(webapi, state) {
  const wapiBlock = Raw.deserializeBlock(webapi);

  // Insert before the exports line
  const exportBlk = state.document.findDescendant(
    blk => blk.get("type") === "export_decs"
  );
  const prevTxt = state.document
    .getPreviousSibling(exportBlk.key)
    .getLastText();
  const prevTxtOffset = prevTxt.text.length;
  let transform = state.transform().deselect().select({
    anchorKey: prevTxt.key,
    anchorOffset: prevTxtOffset,
    focusKey: prevTxt.key,
    focusOffset: prevTxtOffset
  });

  // insert all block except imports and export here.
  wapiBlock.nodes
    .filter(filterImpExp)
    .forEach(blk => transform = transform.insertBlock(blk));

  // FIXME: insert new imports if any.

  // insert exports
  const expBlks = wapiBlock.filterDescendants(
    node => node.get("type") === "export_dec"
  );
  const expBlkTxt = exportBlk.getFirstText();
  const offset = exportBlk.getText().indexOf("{") + 1;
  const exported = exportBlk.data.get("exported") || [];
  let firstDec = false;

  transform = transform.deselect().select({
    anchorKey: expBlkTxt.key,
    anchorOffset: offset,
    focusKey: expBlkTxt.key,
    focusOffset: offset
  });
  if (
    state.document.filterDescendants(
      node => node.get("type") === "export_dec"
    ).size === 0
  ) {
    transform = transform.splitNodeByKey(expBlkTxt.key, offset, {
      normalize: false
    });
    firstDec = true;
  }
  expBlks.forEach((blk, idx) => {
    transform = transform.insertNodeByKey(exportBlk.key, 1, blk);
    exported.push(blk.data.get("exported"));
    if (idx === 0 && firstDec) {
      return;
    }
    transform = transform.insertNodeByKey(exportBlk.key, 2, newText(","));
  });
  transform = transform.setNodeByKey(exportBlk.key, { data: { exported } });
  return transform.apply();
}

module.exports = {
  createApiServerCode: () => createCodeBlock(serverCode),
  extractActionType,
  getApiFunctionName,
  webapiClientFile,
  webapiClientCode,
  addWebapiTransform
};

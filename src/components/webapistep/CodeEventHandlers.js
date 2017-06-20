const { getCodeBlocks } = require("../../webapi");
const { Raw } = require("slate");

function saveWebApi({ block, state }, setEditorState) {
  const code = block.getText();
  getCodeBlocks("webapi_client", code).then(res => {
    const resBlock = res.body;
    const origData = block.data.toJS();
    const wapiBlock = resBlock.nodes.find(blk => blk.type === "webapi");
    const wapiData = { ...origData, ...wapiBlock.data };
    const webapi = Raw.deserializeBlock({
      ...wapiBlock,
      data: wapiData
    });

    let transform = state
      .transform()
      .deselect()
      .collapseToStartOf(block.getFirstText())
      .extendToEndOf(block.getLastText())
      .insertBlock(webapi);

    if (origData.functionName === wapiBlock.data.functionName) {
      return setEditorState(transform.apply(), wapiData);
    }

    // Update exported data.
    const expDecs = state.document.findDescendant(
      node => node.get("type") === "export_decs"
    );

    const expBlock = state.document
      .filterDescendants(node => node.get("type") === "export_dec")
      .find((node, idx) => node.data.get("exported") === origData.functionName);

    if (!expBlock) {
      throw new Error(
        "Not able to find export block for " + origData.functionName
      );
    }
    let newState = transform
      .deselect()
      .collapseToStartOf(expBlock.getFirstText())
      .extendToEndOf(expBlock.getLastText())
      .insertText(wapiBlock.data.functionName)
      .setNodeByKey(expBlock.key, {
        data: { exported: wapiBlock.data.functionName }
      })
      .apply();

    const exported = newState.document
      .filterDescendants(node => node.get("type") === "export_dec")
      .map(exp => exp.data.get("exported"))
      .toJS();

    transform = newState
      .transform()
      .deselect()
      .setNodeByKey(expDecs.key, { data: { exported } });

    setEditorState(transform.apply(), wapiData);
  });
}

module.exports = {
  saveWebApi
};

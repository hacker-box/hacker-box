const { Raw } = require("slate");
const { newText } = require("../../common/components/codeslate");

function saveAction({ block, state }, setEditorState) {
  const code = block.getText();
  const action = code.split(":").shift().trim();
  const prevAction = block.data.get("action");
  const data = { ...block.data.toJS(), action };

  if (prevAction === action) {
    return setEditorState(state, data);
  }

  let tranState = state
    .transform()
    .unselect()
    .setNodeByKey(block.key, { data });

  // Update parent actions data
  const actionsBlk = state.document.getParent(block.key);
  const actionsData = actionsBlk.data.toJS();
  actionsData.actions = actionsData.actions.map(
    ac => ac === prevAction ? action : ac
  );
  tranState = tranState
    .unselect()
    .setNodeByKey(actionsBlk.key, { data: actionsData });
  setEditorState(tranState.apply(), data);
}

function addApiAction(action, actionsBlock, tranState) {
  const actionData = actionsBlock.data.toJS();
  const hasActions = tranState.document.filterDescendants(
    node => node.get("type") === "action" && !node.data.get("isIdent")
  ).size > 0;
  const actionTxt = actionsBlock.getFirstText();
  const offset = actionsBlock.getText().indexOf("{") + 1;

  tranState = tranState.transform().deselect().select({
    anchorKey: actionTxt.key,
    anchorOffset: offset,
    focusKey: actionTxt.key,
    focusOffset: offset
  });

  // split empty createActions({})
  if (!hasActions) {
    tranState = tranState.splitNodeByKey(actionTxt.key, offset, {
      normalize: false
    });
  }

  tranState = tranState.insertNodeByKey(
    actionsBlock.key,
    1,
    Raw.deserializeBlock(action)
  );
  if (hasActions) {
    tranState = tranState.insertNodeByKey(actionsBlock.key, 2, newText(","));
  }

  actionData.actions.push(action.data.action);
  tranState = tranState.setNodeByKey(actionsBlock.key, {
    data: actionData
  });

  return tranState.apply();
}

function addIdentAction(action, actionsBlock, tranState) {
  return tranState;
}

function addAction(rawAction, state) {
  let tranState = state;
  const apiImport = rawAction.nodes
    .filter(node => node.type === "import_dec")
    .shift();
  const importNodes = state.document.filterDescendants(
    node => node.get("type") === "import_dec"
  );
  const currImports = importNodes.map(node => node.data.get("module"));

  if (!currImports.includes(apiImport.data.module)) {
    const selectMark = state.document
      .getNextBlock(importNodes.last().key)
      .getFirstText();
    const prevIgnoreBlock = rawAction.nodes[
      rawAction.nodes.findIndex(node => node === apiImport) - 1
    ]; // For "const =" ignore block.
    tranState = tranState
      .transform()
      .deselect()
      .select({
        anchorKey: selectMark.key,
        anchorOffset: 0,
        focusKey: selectMark.key,
        focusOffset: 0
      })
      .insertBlock(Raw.deserializeBlock(prevIgnoreBlock))
      .insertBlock(Raw.deserializeBlock(apiImport))
      .apply();
  }

  // Add actions
  const actionsBlock = state.document.findDescendant(
    node => node.get("type") === "actions"
  );
  const actionNodes = rawAction.nodes.find(
    node => node.type === "actions"
  ).nodes;
  const apiAction = actionNodes.find(
    node => node.type === "action" && !node.data.isIdent
  );

  if (apiAction) {
    return addApiAction(apiAction, actionsBlock, tranState);
  }

  const identAction = actionNodes.find(
    node => node.type === "action" && node.data.isIdent
  );
  if (identAction) {
    return addIdentAction(identAction, actionsBlock, tranState);
  }
  return tranState;
}

module.exports = {
  saveAction,
  addAction
};

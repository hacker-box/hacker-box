const { getCodeBlocks } = require("../../webapi");
const { Raw } = require("slate");
const { newText } = require("../../common/components/codeslate");

function saveReducer({ block, state }, setEditorState) {
  const code = block.getText();

  getCodeBlocks("reducers", code).then(res => {
    const rawReducer = res.body;
    const fnNode = rawReducer.nodes.find(
      node => node.type === "reducer_function"
    );
    const origData = block.data.toJS();

    if (!fnNode || origData.functionName === fnNode.data.functionName) {
      return setEditorState(state);
    }

    const data = { ...block.data.toJS(), ...fnNode.data };
    let tranState = state
      .transform()
      .deselect()
      .setNodeByKey(block.key, { data });

    const reducerBlock = state.document.findDescendant(
      node =>
        node.get("type") === "reducer" &&
        node.data.get("reducer") === origData.reducer
    );

    if (!reducerBlock) {
      console.warn(
        "Not able to find the reducer block to update function name"
      );
      return setEditorState(tranState.apply());
    }

    const reducerTxt = reducerBlock.getFirstText();
    const offset = reducerTxt.text.indexOf(origData.functionName);
    const reducerData = {
      ...reducerBlock.data.toJS(),
      reducer: fnNode.data.functionName
    };

    if (offset === -1) {
      console.warn(
        `Not able to find the functioName "${origData.functionName}" in handleActions. Not updated`
      );
      return setEditorState(tranState.apply(), reducerData);
    }
    tranState = tranState
      .deselect()
      .select({
        anchorKey: reducerTxt.key,
        anchorOffset: offset,
        focusKey: reducerTxt.key,
        focusOffset: offset
      })
      .extend(origData.functionName.length)
      .insertText(fnNode.data.functionName)
      .deselect()
      .setNodeByKey(reducerBlock.key, { data: reducerData });

    setEditorState(tranState.apply(), reducerData);
  });
}

function addToHandleActions(reducer, reducersBlock, state, tranState) {
  const reducerData = reducersBlock.data.toJS();
  const hasReducers = state.document.filterDescendants(
    node => node.get("type") === "reducer"
  ).size > 0;
  const reducerTxt = reducersBlock.getFirstText();
  const offset = reducersBlock.getText().indexOf("{") + 1;

  tranState = tranState.deselect().select({
    anchorKey: reducerTxt.key,
    anchorOffset: offset,
    focusKey: reducerTxt.key,
    focusOffset: offset
  });

  // split empty handleActions({})
  if (!hasReducers) {
    tranState = tranState.splitNodeByKey(reducerTxt.key, offset, {
      normalize: false
    });
  }

  tranState = tranState.insertNodeByKey(
    reducersBlock.key,
    1,
    Raw.deserializeBlock(reducer)
  );
  if (hasReducers) {
    tranState = tranState.insertNodeByKey(reducersBlock.key, 2, newText(","));
  }

  reducerData.reducers.push(reducer.data.reducer);
  tranState = tranState.setNodeByKey(reducersBlock.key, {
    data: reducerData
  });

  return tranState.apply();
}

function addReducer(rawReducer, state) {
  const reducersBlock = state.document.findDescendant(
    node => node.get("type") === "reducers"
  );

  // Add reducer_function
  const functionNode = rawReducer.nodes.find(
    node => node.type === "reducer_function"
  );
  const selectPos = state.document
    .getPreviousBlock(reducersBlock.key)
    .getLastText();
  const offset = selectPos.text.length;

  let tranState = state
    .transform()
    .deselect()
    .select({
      anchorKey: selectPos.key,
      anchorOffset: offset,
      focusKey: selectPos.key,
      focusOffset: offset
    })
    .insertBlock(Raw.deserializeBlock(functionNode));

  // Add reducers
  const reducerNodes = rawReducer.nodes.find(node => node.type === "reducers");
  const newReducer = reducerNodes.nodes.find(node => node.type === "reducer");

  if (newReducer) {
    return addToHandleActions(newReducer, reducersBlock, state, tranState);
  }

  return state;
}

module.exports = {
  saveReducer,
  addReducer
};

const { handleActions } = require("redux-actions");
const update = require("immutability-helper");
const { getSuggestions } = require("../../plugins/plugin");

const defaultState = {
  current: null
};

const defaultFile = {
  data: [],
  updates: []
};

const receiveFiles = (state, { payload }) => {
  Object.keys(payload || {}).forEach(fileId => {
    const locFile = state[fileId] || {};
    payload[fileId] = { ...defaultFile, ...payload[fileId], ...locFile };
  });
  return update(state, { $merge: payload });
};

function receiveEditorState(state, { payload }) {
  const { type, fileId, editorState } = payload;
  return update(state, {
    [fileId]: { [type]: { $set: editorState }, updated: { $set: Date.now() } }
  });
}

const setCurrentFile = (state, { payload }) =>
  update(state, { current: { $set: payload } });

const receiveFileContent = (state, { payload: file }) =>
  update(state, {
    [file.uid]: {
      $set: { ...defaultFile, ...file, ...(state[file.uid] || {}) }
    }
  });

const updateFile = (state, { payload: file }) =>
  update(state, { [file.uid]: { $merge: file } });

const receiveAddFile = (state, { payload: file }) =>
  update(state, {
    [file.uid]: {
      $set: { ...defaultFile, ...file, ...(state[file.uid] || {}) }
    }
  });

const updateEditorData = (state, { payload }) => {
  const { fileId, fileIds, action } = payload;
  const { path: actionPath, value, leftKey, parentNodeType } = action;
  let leafValue = value;
  const path = actionPath.slice(0);

  path.unshift(fileId, "data");

  switch (action.action) {
    case "deleted":
      if (parentNodeType === "array") {
        path.push("$splice");
        leafValue = [[leftKey, 1]];
      } else {
        path.push("$unset");
        leafValue = [leftKey];
      }
      break;
    default:
      if (leftKey !== void 0) {
        path.push(leftKey);
      }
      path.push("$set");
      break;
  }

  const updatePath = path
    .reverse()
    .reduce((leaf, key) => ({ [key]: leaf }), leafValue);

  // Unset file.dataState so it will update from file.data
  updatePath[fileId] = { ...updatePath[fileId], $unset: ["dataState"] };

  // set updates from plugins
  fileIds.forEach(fid => {
    const curr = updatePath[fid] || {};
    const file = state[fid];
    if (!file) {
      console.log("No file found for file id", fid);
      return;
    }
    const suggestions = getSuggestions(file.module, payload, file);
    if (suggestions && suggestions.length > 0) {
      updatePath[fid] = {
        ...curr,
        updates: { $push: getSuggestions(file.module, payload, file) }
      };
    }
  });
  return update(state, updatePath);
};

function removeSuggestion(state, { payload }) {
  const { fileId, suggestion } = payload;
  const idx = ((state[fileId] || {}).updates || [])
    .findIndex(sug => sug.caption === suggestion.caption);
  return idx === -1
    ? state
    : update(state, { [fileId]: { updates: { $splice: [[idx, 1]] } } });
}

module.exports = handleActions(
  {
    GET_FILES: receiveFiles,
    SET_EDITOR_STATE: receiveEditorState,
    SET_CURRENT_FILE: setCurrentFile,
    GET_FILE_CONTENT: receiveFileContent,
    UPDATE_EDITOR_DATA: updateEditorData,
    UPDATE_FILE: updateFile,
    ADD_FILE: receiveAddFile,
    REMOVE_SUGGESTION: removeSuggestion
  },
  defaultState
);

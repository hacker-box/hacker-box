const { createActions } = require("redux-actions");
const { getFileContent, setEditorState, getFiles, updateFile } = require("./fbapi");
const { firebaseAction } = require("../../common/firebase");

module.exports = createActions(
  {
    GET_FILES: firebaseAction(getFiles, ["appId", "fileIds"]),
    GET_FILE_CONTENT: firebaseAction(getFileContent, ["userId"]),
    SET_EDITOR_STATE: firebaseAction(setEditorState, ["payload"]),
    UPDATE_FILE: firebaseAction(updateFile, ["file"])
  },
  "SET_CURRENT_FILE",
  "UPDATE_EDITOR_DATA",
  "UPDATE_EDITOR_CODE",
  "REMOVE_SUGGESTION"
);

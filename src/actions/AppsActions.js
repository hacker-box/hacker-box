const { createActions } = require("redux-actions");
const { firebaseAction } = require("../common/firebase");
const {
  getCodeForJSON,
  getFakers,
  triggerAction,
  getCodeBlocks
} = require("../webapi");

const {
  addApp,
  addState,
  removeApp,
  getUserApps,
  getAppInfo,
  addWebApi,
  getWebApi,
  setApiState,
  addAction,
  addReducer,
  setRelations,
  getActions,
  getReducers,
  getState,
  addFile,
  updateModule
} = require("../fbapi");

module.exports = createActions(
  {
    ADD_APP: firebaseAction(addApp, ["userId"]),
    REMOVE_APP: firebaseAction(removeApp, ["userId", "appId"]),
    ADD_FILE: firebaseAction(addFile, ["userId", "appId"]),
    GET_USER_APPS: firebaseAction(getUserApps, ["userId"]),
    GET_APP_INFO: firebaseAction(getAppInfo, ["userId", "appId"]),
    ADD_WEB_API: firebaseAction(addWebApi, ["userId", "appId"]),
    GET_WEB_API: firebaseAction(getWebApi, ["appId", "webApiIds"]),
    SET_API_STATE: firebaseAction(setApiState),
    GET_CODE_FOR_JSON: [getCodeForJSON, meta => meta],
    GET_FAKERS: getFakers,
    ADD_ACTION: firebaseAction(addAction, ["userId", "appId", "relations"]),
    ADD_REDUCER: firebaseAction(addReducer, ["userId", "appId", "relations"]),
    SET_RELATIONS: firebaseAction(setRelations, ["userId", "appId"]),
    GET_ACTIONS: firebaseAction(getActions, ["appId", "webApiIds"]),
    GET_REDUCERS: firebaseAction(getReducers, ["appId", "webApiIds"]),
    TRIGGER_ACTION: triggerAction,
    ADD_STATE: firebaseAction(addState, ["userId", "appId"]),
    GET_STATE: firebaseAction(getState, ["appId", "stateIds"]),
    GET_CODE_BLOCKS: getCodeBlocks,
    UPDATE_WEB_API: firebaseAction(updateModule("webapi"), [
      "userId",
      "appId",
      "module"
    ]),
    UPDATE_ACTION: firebaseAction(updateModule("actions"), [
      "userId",
      "appId",
      "module"
    ]),
    UPDATE_REDUCER: firebaseAction(updateModule("reducers"), [
      "userId",
      "appId",
      "module"
    ])
  },
  "SET_CURRENT",
  "SET_CURRENT_MODULE",
  "SET_APP_DATA",
  "ADD_NOTIFICATION",
  "REMOVE_NOTIFICATION",
  "TOGGLE_COMMAND",
  "SET_DEV_SERVER_PATH",
  "SET_DEV_SERVER_STATE"
);

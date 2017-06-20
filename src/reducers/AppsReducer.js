const { handleActions } = require("redux-actions");
const _get = require("lodash.get");
const _isEqual = require("lodash.isequal");
const { createCodeBlock } = require("../common/components/codeslate");
const update = require("immutability-helper");

const defaultState = {
  apps: {},
  appData: {},
  fakers: [],
  notifications: [],
  updates: [],
  commandOpen: false
};

const defaultApp = {
  actions: {},
  components: {},
  containers: {},
  reducers: {},
  webapi: {},
  files: {},
  relations: []
};

const removeApp = (state, { payload: appId }) => ({
  ...state,
  apps: {
    ...state.apps,
    [appId]: false
  }
});

const receiveApps = (state, { payload: apps }) => {
  const appsWithDefaults = Object.keys(apps || {}).reduce(
    (appMap, appId) => ({
      ...appMap,
      [appId]: { ...defaultApp, ...apps[appId] }
    }),
    {}
  );

  return {
    ...state,
    apps: {
      ...state.apps,
      ...appsWithDefaults
    }
  };
};

const setCurrent = (state, { payload: current }) => ({
  ...state,
  current
});

const updateApp = (state, { payload: app }) => ({
  ...state,
  apps: {
    ...state.apps,
    [app.uid]: {
      ...defaultApp,
      ...(state.apps[app.uid] || {}),
      ...app
    }
  }
});

const updateAppModule = module =>
  (state, { payload: mods, meta }) => {
    const { appId } = meta;
    const newMods = mods.uid ? { [mods.uid]: mods } : mods;

    return Object.keys(newMods).reduce(
      (newState, id) => {
        const action = typeof _get(
          newState,
          `apps.${appId}.${module}.${id}`
        ) === "object"
          ? "$merge"
          : "$set";

        const path = {
          apps: {
            [appId]: {
              [module]: {
                [id]: {
                  [action]: newMods[id]
                }
              }
            }
          }
        };
        return update(newState, path);
      },
      state
    );
  };

const receiveJson2Faker = (state, { payload, meta }) => {
  const { appId, apiId } = meta;
  const editor = createCodeBlock(payload.text);
  const server = { editor, state: null }; // set state null to it recreates in ApiBuilder.
  const path = {
    apps: { [appId]: { webapi: { [apiId]: { $merge: server } } } }
  };
  return update(state, path);
};

const setApiState = (state, { payload }) => {
  const { appId, id, type, editorKey, editorState } = payload;
  const path = editorKey
    ? {
        apps: {
          [appId]: {
            [type]: { [id]: { [editorKey]: { state: { $set: editorState } } } }
          }
        }
      }
    : {
        apps: {
          [appId]: { [type]: { [id]: { state: { $set: editorState } } } }
        }
      };
  return update(state, path);
};

const receiveFakers = (state, { payload }) => ({
  ...state,
  fakers: payload.body
});

const setCurrentModule = (state, { payload }) => {
  const { appId, id, type } = payload;
  const path = { apps: { [appId]: { [type]: { current: { $set: id } } } } };
  return update(state, path);
};

const setAppData = (state, { payload }) => {
  const { appId, appData } = payload;
  const prevAppData = _get(state, `appData.${appId}`, {});
  return {
    ...state,
    appData: {
      ...state.appData,
      [appId]: { ...prevAppData, ...appData }
    }
  };
};

function receiveNotification(state, { payload }) {
  const exist = state.notifications.find(
    noti => _isEqual(noti, payload) && _isEqual(noti.data, payload.data)
  );
  return exist ? state : update(state, { notifications: { $push: [payload] } });
}

function removeNotification(state, { payload }) {
  delete payload.caption;
  const existIdx = state.notifications.findIndex(
    noti => _isEqual(noti, payload) && _isEqual(noti.data, payload.data)
  );
  return existIdx === -1
    ? state
    : update(state, { notifications: { $splice: [[existIdx, 1]] } });
}

function receiveEditorUpdates(state, { payload }) {
  const exist = state.updates.find(
    noti => _isEqual(noti, payload) && _isEqual(noti.data, payload.data)
  );
  return exist ? state : update(state, { updates: { $push: [payload] } });
}

function toggleCommand(state, { payload: open }) {
  return update(state, { commandOpen: { $set: open } });
}

const receiveDevServer = key =>
  (state, { payload }) => {
    const { appId } = payload;
    const devUrl = _get(state, `appData.${appId}.devServerUrl`);
    if (!devUrl) {
      return state;
    }
    return update(state, {
      appData: { [appId]: { [key]: { $set: payload[key] } } }
    });
  };

module.exports = handleActions(
  {
    ADD_APP: updateApp,
    REMOVE_APP: removeApp,
    GET_USER_APPS: receiveApps,
    SET_CURRENT: setCurrent,
    GET_APP_INFO: updateApp,
    ADD_WEB_API: updateAppModule("webapi"),
    GET_WEB_API: updateAppModule("webapi"),
    UPDATE_WEB_API: updateAppModule("webapi"),
    SET_API_STATE: setApiState,
    SET_CURRENT_MODULE: setCurrentModule,
    GET_CODE_FOR_JSON: receiveJson2Faker,
    SET_RELATIONS: updateAppModule("relations"),
    GET_FAKERS: receiveFakers,
    GET_ACTIONS: updateAppModule("actions"),
    GET_REDUCERS: updateAppModule("reducers"),
    ADD_ACTION: updateAppModule("actions"),
    ADD_REDUCER: updateAppModule("reducers"),
    ADD_STATE: updateAppModule("state"),
    GET_STATE: updateAppModule("state"),
    SET_APP_DATA: setAppData,
    ADD_NOTIFICATION: receiveNotification,
    REMOVE_NOTIFICATION: removeNotification,
    UPDATE_ACTION: updateAppModule("actions"),
    UPDATE_REDUCER: updateAppModule("reducers"),
    ADD_FILE: updateAppModule("files"),
    UPDATE_EDITOR_DATA: receiveEditorUpdates,
    TOGGLE_COMMAND: toggleCommand,
    SET_DEV_SERVER_PATH: receiveDevServer("devServerPath"),
    SET_DEV_SERVER_STATE: receiveDevServer("devServerState")
  },
  defaultState
);

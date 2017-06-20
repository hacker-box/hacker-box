const { handleActions } = require("redux-actions");
const update = require("immutability-helper");
const _get = require("lodash.get");

const APPDATA_REGEX = />>STATUS_READY<<(.*)/;
const defaultState = {};

function updateAppData(state, { payload }) {
  const { appId, id, msg } = payload;
  const appData = msg && msg.match(APPDATA_REGEX);
  if (!appData || !appData[1]) {
    return state;
  }
  try {
    const data = JSON.parse(appData[1].trim());
    data.devServerTaskId = id;
    const currData = _get(state, `${appId}.data`, {});

    return {
      ...state,
      [appId]: {
        ...(state[appId] || {}),
        data: {
          ...currData,
          ...data
        }
      }
    };
  } catch (err) {
    console.error(err);
    return state;
  }
}

function receiveCommandOutput(state, { payload }) {
  const { id, appId } = payload;
  const updatedState = updateAppData(state, { payload });
  const path = {
    [appId]: {
      tasks: {
        [id]: { status: { $set: payload.action }, logs: { $push: [payload] } }
      }
    }
  };
  return update(updatedState, path);
}

function addCommand(state, { payload }) {
  const { id, appId, command } = payload;
  const currTasks = _get(state, `${appId}.tasks`, {});
  return {
    ...state,
    [appId]: {
      ...(state[appId] || {}),
      tasks: {
        ...currTasks,
        [id]: {
          logs: [],
          command
        }
      }
    }
  };
}

function taskStopped(state, { payload }) {
  const { appId, taskId } = payload;
  const devId = _get(state, `${appId}.data.devServerTaskId`);
  if (devId !== taskId) {
    return state;
  }
  const state1 = update(state, {
    [appId]: { data: { $unset: ["devServerTaskId"] } }
  });
  return update(state1, {
    [appId]: { data: { $unset: ["devServerUrl"] } }
  });
}

module.exports = handleActions(
  {
    ADD_COMMAND: addCommand,
    COMMAND_OUTPUT: receiveCommandOutput,
    TASK_STOPPED: taskStopped,
    SET_CURRENT_TERMINAL: (state, { payload: current }) => ({
      ...state,
      current
    })
  },
  defaultState
);

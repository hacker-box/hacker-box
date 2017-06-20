const { handleActions, combineActions } = require("redux-actions");

const defaultState = {
  flags: {
    showError: false,
    loading: false
  }
};

const setFlag = (state, { payload: flag, type }) => ({
  ...state,
  flags: {
    ...state.flags,
    [type.split("/").pop()]: flag
  }
});

const flagAction = combineActions("FLAGS/SHOW_ERROR", "FLAGS/LOADING");

module.exports = handleActions(
  {
    [flagAction]: setFlag
  },
  defaultState
);

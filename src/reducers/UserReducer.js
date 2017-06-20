const { handleActions } = require("redux-actions");

const defaultState = {};

module.exports = handleActions(
  {
    SET_USER: (state, action) => ({
      ...state,
      user: action.payload
    }),
    SET_CLI_CONNECT: (state, action) => ({
      ...state,
      cli: action.payload
    }),
    SET_CLI_DISCONNECT: (state, action) => ({
      ...state,
      cli: null
    }),
    GET_PASSWORD_PIN: (state, { payload: res }) => ({
      ...state,
      passcode: res.body.passcode
    }),
    RESET_PIN: (state, action) => ({ ...state, passcode: null }),
    SET_CLI_DATA: (state, action) => ({
      ...state,
      cli: { ...state.cli, hbox: action.payload }
    })
  },
  defaultState
);

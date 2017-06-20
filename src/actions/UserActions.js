const { createActions } = require("redux-actions");
const { firebaseAction } = require("../common/firebase");
const { setUser, getFirebaseToken, setCliData } = require("../fbapi");
const { getUserToken, getPasswordPin } = require("../webapi");

module.exports = createActions(
  {
    SET_USER: firebaseAction(setUser),
    GET_USER_TOKEN: getUserToken,
    GET_FIREBASE_TOKEN: firebaseAction(getFirebaseToken),
    GET_PASSWORD_PIN: getPasswordPin,
    SET_CLI_DATA: firebaseAction(setCliData)
  },
  "SET_CLI_CONNECT",
  "SET_CLI_DISCONNECT",
  "RESET_PIN"
);

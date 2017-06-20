const firebase = require("firebase");
const { loadJsonFromScript } = require("../utils/LoadingUtil");
const createFirebasMiddleware = require("../middleware/FirebaseMiddleware");

const baseAppCloneCommands = [
  "git clone https://github.com/hacker-box/hacker-box-base .",
  "git remote rm origin"
];

const onUserCreator = (dispatch, action) =>
  fbUser => {
    const user = { ...fbUser, settings: { baseAppCloneCommands } };
    dispatch(action.setUser(user)).then(() => {
      const cliRef = firebase.database().ref(`users/${user.uid}/queue/workers`);
      cliRef.on("child_added", snap =>
        dispatch(action.setCliConnect({ ...snap.val(), uid: snap.key })));
      cliRef.on("child_removed", snap =>
        dispatch(action.setCliDisconnect(snap.val())));
    });
  };

const authStateChangeCreator = (dispatch, action) =>
  user => {
    //const auth = firebase.auth();
    const onUser = onUserCreator(dispatch, action);

    if (user) {
      return onUser(user.toJSON());
    }
    /*
    dispatch(action.getUserToken()).then(({ payload: res }) =>
      auth
        .signInWithCustomToken(res.body.token)
        .then(anon => onUser(anon.toJSON())));
        */
  };

const listeners = dispatch => {
  return {
    onAuthStateChanged: action =>
      firebase
        .auth()
        .onAuthStateChanged(authStateChangeCreator(dispatch, action))
  };
};

const initFirebase = (dispatch, scriptId) => {
  firebase.initializeApp(loadJsonFromScript(scriptId || "firebase-config"));
  return listeners(dispatch);
};

const firebaseMiddleware = () => createFirebasMiddleware(firebase);

const firebaseAction = (payloadCreator, meta) => {
  function createMeta() {
    const isFb = { isFirebase: true };
    if (meta && Array.isArray(meta)) {
      return meta.reduce(
        (metaObj, arg, idx) => ({ ...metaObj, [arg]: arguments[idx] }),
        isFb
      );
    }
    return isFb;
  }
  return [payloadCreator, createMeta];
};

module.exports = {
  initFirebase,
  firebaseMiddleware,
  firebaseAction,
  onUserCreator
};

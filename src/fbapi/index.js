const { serialize } = require("../common/components/codeslate");
const { mergeRelation } = require("../utils/Relations");
const { createStateCode } = require("../components/stateview/StateUtils");
const _get = require("lodash.get");

function createRefAndAdd(
  fdb,
  ref,
  newPathCreator,
  newItemCreator = uid => ({ uid })
) {
  const newRef = fdb.ref(ref).push();
  const uid = newRef.key;
  const newItem = newItemCreator(uid);

  newRef.set(true);

  return fdb
    .ref(newPathCreator(uid))
    .set({ ...newItem, updated: Date.now() })
    .then(() => newItem);
}

const reduceSnapshots = snapshots =>
  snapshots.reduce(
    (valMap, snapshot) => {
      const val = snapshot && snapshot.val() !== null ? snapshot.val() : {};
      return {
        ...valMap,
        [val.uid]: val
      };
    },
    {}
  );

const addApp = (userId, app) =>
  firebase =>
    createRefAndAdd(
      firebase.database(),
      `users/${userId}/apps`,
      uid => `apps/${uid}/${userId}`,
      uid => ({
        uid,
        meta: app,
        webapi: {},
        relations: [],
        actions: {},
        reducers: {},
        state: {},
        components: {},
        containers: {}
      })
    );

const removeApp = (userId, appId) =>
  firebase => {
    const userAppRef = firebase.database().ref(`users/${userId}/apps/${appId}`);
    return userAppRef.set(false).then(() => appId);
  };

const getUserApps = userId =>
  firebase =>
    firebase
      .database()
      .ref(`users/${userId}/apps`)
      .once("value")
      .then(snapshot => snapshot.val() || {});

const setUser = user =>
  firebase =>
    firebase
      .database()
      .ref(`users/${user.uid}`)
      .update({ uid: user.uid, settings: user.settings })
      .then(() => user);

const getAppInfo = (userId, appId) =>
  firebase => {
    return firebase
      .database()
      .ref(`apps/${appId}/${userId}`)
      .once("value")
      .then(snapshot => snapshot.val());
  };

const addState = (userId, appId) =>
  firebase =>
    createRefAndAdd(
      firebase.database(),
      `apps/${appId}/${userId}/state`,
      uid => `state/${uid}`,
      uid => ({
        uid,
        editor: createStateCode()
      })
    );

let tout;
const wait = 2000;
const setApiState = payload =>
  firebase => {
    clearTimeout(tout);
    tout = setTimeout(
      () => {
        const { id, type, editorKey, editorState } = payload;
        const editor = serialize(editorState);
        console.log(">> Autosaving editor changes");
        firebase
          .database()
          .ref(editorKey ? `${type}/${id}/${editorKey}` : `${type}/${id}`)
          .update({ editor });
      },
      wait
    );
    return Promise.resolve(payload);
  };

const addWebApi = (userId, appId, webapi) =>
  firebase =>
    createRefAndAdd(
      firebase.database(),
      `apps/${appId}/${userId}/webapi`,
      uid => `webapi/${uid}`,
      uid => ({
        uid,
        ...webapi
      })
    );

const getWebApi = (appId, apiIds) =>
  firebase =>
    Promise.all(
      apiIds.map(apiId =>
        firebase.database().ref(`webapi/${apiId}`).once("value"))
    ).then(reduceSnapshots);

const getState = (appId, stateIds) =>
  firebase =>
    Promise.all(
      stateIds.map(stateId =>
        firebase.database().ref(`state/${stateId}`).once("value"))
    ).then(reduceSnapshots);

const addAction = (userId, appId, action) =>
  firebase =>
    createRefAndAdd(
      firebase.database(),
      `apps/${appId}/${userId}/actions`,
      uid => `actions/${uid}`,
      uid => ({
        uid,
        ...action
      })
    );

const addReducer = (userId, appId, reducer) =>
  firebase =>
    createRefAndAdd(
      firebase.database(),
      `apps/${appId}/${userId}/reducers`,
      uid => `reducers/${uid}`,
      uid => ({
        uid,
        ...reducer
      })
    );

const setRelations = (userId, appId, knots) =>
  firebase =>
    firebase
      .database()
      .ref(`apps/${appId}/${userId}/relations`)
      .transaction(
        relations => mergeRelation(relations, knots),
        () => {},
        false
      )
      .then(({ snapshot }) => snapshot.val());

const getActions = (appId, actionIds) =>
  firebase =>
    Promise.all(
      actionIds.map(actionId =>
        firebase.database().ref(`actions/${actionId}`).once("value"))
    ).then(reduceSnapshots);

const getReducers = (appId, reducerIds) =>
  firebase =>
    Promise.all(
      reducerIds.map(reducerId =>
        firebase.database().ref(`reducers/${reducerId}`).once("value"))
    ).then(reduceSnapshots);

const getFirebaseToken = () =>
  firebase => firebase.auth().currentUser.getToken(true);

const addFile = (userId, appId, file) =>
  firebase =>
    createRefAndAdd(
      firebase.database(),
      `apps/${appId}/${userId}/files`,
      uid => `files/${uid}`,
      uid => ({
        uid,
        ...file
      })
    );

const updateModule = type =>
  (userId, appId, module) =>
    firebase =>
      firebase
        .database()
        .ref(`${type}/${module.uid}`)
        .update(module)
        .then(() => module);

const setCliData = (userId, cliId, hbox) =>
  firebase =>
    firebase
      .database()
      .ref(`users/${userId}/queue/workers/${cliId}/hbox`)
      .set(hbox)
      .then(() => hbox);

module.exports = {
  addApp,
  removeApp,
  getUserApps,
  getAppInfo,
  setUser,
  addWebApi,
  getWebApi,
  setApiState,
  addAction,
  addReducer,
  setRelations,
  getActions,
  getReducers,
  addState,
  getState,
  getFirebaseToken,
  addFile,
  updateModule,
  setCliData
};

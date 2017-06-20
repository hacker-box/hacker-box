const {
  serialize,
  deserialize,
  getCode
} = require("../../common/components/codeslate");

const saveOnChange = (function() {
  let lastCode = null;
  return function(firebase, payload) {
    const { type, fileId, editorState } = payload;
    const code = getCode(editorState);
    if (lastCode !== code) {
      console.log(">> Autosaving editor changes", type);
      const rawState = serialize(editorState);
      firebase.database().ref(`files/${fileId}/${type}`).set(rawState);
      if (type === "codeState") {
        firebase.database().ref(`files/${fileId}/updated`).set(Date.now());
      }
    }
    lastCode = code;
    return;
  };
})();

let tout = {};
const wait = 1000;
const setEditorState = payload =>
  firebase => {
    const { type } = payload;
    clearTimeout(tout[type]);
    tout[type] = setTimeout(() => saveOnChange(firebase, payload), wait);
    return Promise.resolve(payload);
  };

const deserializeEditorState = file => {
  let { codeState, dataState, data } = file;
  try {
    if (typeof codeState === "string") {
      codeState = deserialize(codeState);
    }
    if (typeof dataState === "string") {
      dataState = deserialize(dataState);
    }

    if (!file.data) {
      data = [];
    } else if (typeof file.data === "string") {
      data = JSON.parse(data);
    }
  } catch (err) {
    console.error(err);
  }
  return { ...file, codeState, dataState, data };
};

const serializeEditorState = (key, value) => {
  if (key === "data" && typeof value !== "string") {
    return JSON.stringify(value);
  }
  return value;
};

const getFileContent = fileId =>
  firebase =>
    firebase
      .database()
      .ref(`files/${fileId}`)
      .once("value")
      .then(snap => deserializeEditorState(snap.val()));

const reduceSnapshots = snapshots =>
  snapshots.reduce(
    (valMap, snapshot) => {
      const val = snapshot && snapshot.val() !== null ? snapshot.val() : {};
      return {
        ...valMap,
        [val.uid]: deserializeEditorState(val)
      };
    },
    {}
  );

const getFiles = (appId, fileIds) =>
  firebase =>
    Promise.all(
      fileIds.map(fileId =>
        firebase.database().ref(`files/${fileId}`).once("value"))
    ).then(reduceSnapshots);

const updateFile = file =>
  firebase => {
    console.log(">> Saving data");
    return Promise.all(
      Object.keys(file).map(key =>
        firebase
          .database()
          .ref(`files/${file.uid}/${key}`)
          .set(serializeEditorState(key, file[key])))
    ).then(() => file);
  };

module.exports = {
  setEditorState,
  getFileContent,
  getFiles,
  updateFile
};

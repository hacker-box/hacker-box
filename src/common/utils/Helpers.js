const toArray = obj =>
  Object.keys(obj || {})
    .filter(key => key !== "current")
    .map(id => obj[id])
    .sort((a, b) => a.uid > b.uid);

// temp workaround since redux-promise fail to reject on error
const rejectOnError = fsa =>
  fsa.error ? Promise.reject(fsa.error) : Promise.resolve(fsa);

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (err0) {
    try {
      //yaaa! i know
      return eval(text); //eslint-disable-line
    } catch (err1) {
      throw new Error(err0);
    }
  }
}

const revCamelCaseRegEx = /([A-Z])/g;
const reverseCamelCase = name =>
  name.replace(revCamelCaseRegEx, "_$1").toUpperCase();

const stripJsRegEx = /\.js$/;
const stripDotJs = name => name.replace(stripJsRegEx, "");

const getFileName = filePath => {
  const fileName = stripDotJs(
    filePath.substring(filePath.lastIndexOf("/") + 1)
  );
  if (fileName !== "index") {
    return fileName;
  }
  const pathArr = filePath.split("/");
  return pathArr[pathArr.length - 2];
};

const getDataFromFile = (file, module) => {
  const data = file.data;
  if (!data) {
    return [];
  }
  const item = data.find(itm => itm && itm[module]);
  return item ? item[module] : [];
};

const getLastWriteData = (files, hmapFiles) =>
  files.reduce(
    (writeMap, file) => {
      const curr = hmapFiles[file.uid] || {};
      writeMap[file.uid] = { ...curr, lastWrite: new Date().getTime() };
      return writeMap;
    },
    hmapFiles
  );

module.exports = {
  toArray,
  rejectOnError,
  parseJson,
  reverseCamelCase,
  stripDotJs,
  getFileName,
  getDataFromFile,
  getLastWriteData
};

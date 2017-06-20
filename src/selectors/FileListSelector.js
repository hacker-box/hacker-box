const { createSelector } = require("reselect");
const { toArray } = require("../common/utils/Helpers");
const _get = require("lodash.get");
const {
  FilesSelector,
  AppFileIdsSelector
} = require("./RootSelector");

function FileListSelector(codeType) {
  return createSelector(FilesSelector, AppFileIdsSelector, (files, fileIds) => {
    if (!files) {
      return [];
    }
    const fileList = toArray(files).filter(
      file => fileIds.includes(file.uid) && file.module === codeType
    );
    if (fileList.length === 0) {
      return fileList;
    }
    const indexFile = toArray(files).filter(
      file => fileIds.includes(file.uid) && file.module === `${codeType}Index`
    );
    return indexFile.concat(fileList);
  });
}

module.exports = FileListSelector;

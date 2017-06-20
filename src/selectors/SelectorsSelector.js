const { createSelector } = require("reselect");
const { toArray } = require("../common/utils/Helpers");
const {
  FilesSelector,
  AppFileIdsSelector
} = require("./RootSelector");

const SelectorFilesSelector = createSelector(
  FilesSelector,
  AppFileIdsSelector,
  (files, fileIds) =>
    files &&
    toArray(files).filter(
      file => fileIds.includes(file.uid) && file.module === "selectors"
    )
);

module.exports = {
  SelectorFilesSelector,
};

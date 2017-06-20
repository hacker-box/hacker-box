const { createSelector } = require("reselect");
const CurrentFileIdSelector = state => state.files.current;

const FilesRootSelector = state => state.files;

const CurrentFileSelector = createSelector(
  CurrentFileIdSelector,
  FilesRootSelector,
  (fileId, files) => files[fileId] || {}
);

module.exports = {
  CurrentFileSelector
};

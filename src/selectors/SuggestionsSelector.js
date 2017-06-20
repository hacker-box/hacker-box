const { createSelector } = require("reselect");
const {
  UpdatesSelector,
  AppFileIdsSelector,
  CurrentFileSelector
} = require("./RootSelector");
const { getSuggestions } = require("../plugins/plugin");

const SuggestedFile = (state, file) => file;

const AppUpdates = createSelector(
  AppFileIdsSelector,
  UpdatesSelector,
  (fileIds, updates) => {
    return updates.filter(log => fileIds.includes(log.fileId));
  }
);

const makeFileSuggestions = () => {
  return createSelector(AppUpdates, SuggestedFile, (updateLogs, file) =>
    getSuggestions(file.module, updateLogs, file));
};

const FileSuggestions = createSelector(
  AppUpdates,
  CurrentFileSelector,
  (updateLogs, file) => {
    return getSuggestions(file.module, updateLogs, file);
  }
);

module.exports = {
  AppUpdates,
  makeFileSuggestions,
  FileSuggestions
};

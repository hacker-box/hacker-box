const { createSelector } = require("reselect");
const {
  FilesSelector,
  CurrentAppSelector,
  AppFileIdsSelector,
  CliSelector
} = require("./RootSelector");
const { getTextFromState } = require("../components/fileeditor/Helpers");

const _get = require("lodash.get");

const CurrentAppRoot = createSelector(
  CurrentAppSelector,
  CliSelector,
  (app, cli) => _get(cli, `hbox.apps.${app.uid}.root`)
);

const HboxAppData = createSelector(
  CurrentAppSelector,
  CliSelector,
  (app, cli) => _get(cli, `hbox.apps.${app.uid}`, {})
);

const CurrentAppContent = createSelector(
  CurrentAppSelector,
  AppFileIdsSelector,
  FilesSelector,
  HboxAppData,
  (app, fileIds, files, hboxApp) => {
    return fileIds
      .map(fileId => {
        const file = files[fileId];
        const currFile = _get(hboxApp, `files.${fileId}`);
        if (!file || !file.codeState) {
          return false;
        }
        if (currFile && currFile.lastWrite >= file.updated) {
          return false;
        }
        return {
          uid: file.uid,
          path: file.path,
          code: getTextFromState(file.codeState)
        };
      })
      .filter(f => !!f);
  }
);

module.exports = {
  CurrentAppContent,
  CurrentAppRoot,
  HboxAppData
};

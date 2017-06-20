const { createSelector } = require("reselect");

const UserSelector = state => state.user.user;
const CliSelector = state => state.user.cli;
const AppsSelector = state => state.apps.apps;
const CurrentSelector = state => state.apps.current;
const LocationSelector = state => state.router.location;
const FakersSelector = state => state.apps.fakers;
const PasscodeSelector = state => state.user.passcode;
const AppDataRootSelector = state => state.apps.appData;
const FilesSelector = state => state.files;
const UpdatesSelector = state => state.apps.updates;
const CommandOpenSelector = state => state.apps.commandOpen;

const CurrentAppSelector = createSelector(
  CurrentSelector,
  AppsSelector,
  (appId, apps) => apps[appId] || {}
);

const AppListSelector = createSelector(AppsSelector, apps =>
  Object.keys(apps)
    .filter(appId => apps[appId])
    .map(appId => apps[appId] === true ? { uid: appId } : apps[appId]));

const AppDataSelector = createSelector(
  CurrentSelector,
  AppDataRootSelector,
  (appId, appDataRoot) => appDataRoot[appId] || {}
);

const CurrentFileSelector = createSelector(
  FilesSelector,
  files => files[files.current] || {}
);

const AppFileIdsSelector = createSelector(
  CurrentAppSelector,
  app => app.files ? Object.keys(app.files) : []
);

const DevServerUrlSelector = createSelector(
  AppDataSelector,
  appData => appData.devServerUrl
)

const DevServerStateSelector = createSelector(
  AppDataSelector,
  appData => appData.devServerState
)

module.exports = {
  UserSelector,
  AppsSelector,
  AppListSelector,
  CurrentSelector,
  CurrentAppSelector,
  LocationSelector,
  FakersSelector,
  CliSelector,
  PasscodeSelector,
  AppDataSelector,
  FilesSelector,
  CurrentFileSelector,
  AppFileIdsSelector,
  UpdatesSelector,
  CommandOpenSelector,
  DevServerUrlSelector,
  DevServerStateSelector
};

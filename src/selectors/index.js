const {
  UserSelector,
  AppsSelector,
  CurrentSelector,
  CurrentAppSelector,
  AppListSelector,
  LocationSelector,
  FakersSelector,
  CliSelector,
  PasscodeSelector,
  AppDataSelector,
  AppFileIdsSelector,
  CommandOpenSelector,
  DevServerUrlSelector,
  DevServerStateSelector
} = require("./RootSelector");

const FileListSelector = require("./FileListSelector");
const WebApiFilesSelector = FileListSelector("webapi");
const FakerFilesSelector = FileListSelector("faker");
const ActionFilesSelector = FileListSelector("actions");
const ReducerFilesSelector = FileListSelector("reducers");
const SelectorFilesSelector = FileListSelector("selectors");
const CompFilesSelector = FileListSelector("components");

const StateSelector = require("./StateSelector");

const {
  ActionsNotification,
  ReducersNotification
} = require("./Notifications");
const {
  FileSuggestions,
  makeFileSuggestions
} = require("./SuggestionsSelector");
const {
  CurrentAppContent,
  HboxAppData
} = require("./CurrentAppContent");

module.exports = {
  UserSelector,
  AppsSelector,
  CurrentSelector,
  CurrentAppSelector,
  AppListSelector,
  LocationSelector,
  WebApiFilesSelector,
  FakerFilesSelector,
  FakersSelector,
  CliSelector,
  StateSelector,
  PasscodeSelector,
  AppDataSelector,
  ActionFilesSelector,
  ReducerFilesSelector,
  ActionsNotification,
  ReducersNotification,
  SelectorFilesSelector,
  CompFilesSelector,
  FileSuggestions,
  makeFileSuggestions,
  AppFileIdsSelector,
  CurrentAppContent,
  CommandOpenSelector,
  DevServerUrlSelector,
  HboxAppData,
  DevServerStateSelector
};

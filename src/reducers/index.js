const AppReducer = require("../common/reducers/AppReducer");
const UserReducer = require("./UserReducer");
const AppsReducer = require("./AppsReducer");
const { TerminalReducer } = require("../components/terminal");
const { FilesReducer } = require("../components/fileeditor");

module.exports = {
  app: AppReducer,
  user: UserReducer,
  apps: AppsReducer,
  terminal: TerminalReducer,
  files: FilesReducer
};

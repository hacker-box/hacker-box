const { createActions } = require("redux-actions");
const { firebaseAction } = require("../../common/firebase");

const {
  runCommand,
  getActiveCommands
} = require("./fbapi");

module.exports = createActions(
  {
    RUN_COMMAND: firebaseAction(runCommand),
    GET_ACTIVE_COMMANDS: firebaseAction(getActiveCommands)
  },
  "COMMAND_OUTPUT",
  "ADD_COMMAND",
  "SET_CURRENT_TERMINAL",
  "TASK_STOPPED"
);

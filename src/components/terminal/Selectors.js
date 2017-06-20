const { createSelector } = require("reselect");
const _get = require("lodash.get");
const TerminalRootSelector = state => state.terminal;
const CurrentAppIdSelector = state => state.terminal.current || "USER";

const TaskListSelector = createSelector(
  TerminalRootSelector,
  CurrentAppIdSelector,
  (terminal, appId) => {
    const tasks = _get(terminal, `${appId}.tasks`, {});
    return Object.keys(tasks).map(id => ({
      id,
      ..._get(terminal, `${appId}.tasks.${id}`, {})
    }));
  }
);

const AppDataSelector = createSelector(
  TerminalRootSelector,
  CurrentAppIdSelector,
  (terminal, appId) => _get(terminal, `${appId}.data`, {})
);

module.exports = {
  TaskListSelector,
  AppDataSelector,
  CurrentAppIdSelector
};

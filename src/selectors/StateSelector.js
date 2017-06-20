const { createSelector } = require("reselect");

const {
  CurrentAppSelector
} = require("./RootSelector");

const StateSelector = createSelector(CurrentAppSelector, ({ state }) => {
  if (!state) {
    return {};
  }
  const firstKey = Object.keys(state)[0];
  return firstKey ? state[firstKey] : {};
});

module.exports = StateSelector;

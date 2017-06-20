const { createActions } = require("redux-actions");

const setFlag = flag => !!flag;

module.exports = createActions({
  FLAGS: {
    SHOW_ERROR: setFlag,
    LOADING: setFlag
  }
});

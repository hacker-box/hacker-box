const Actions = require("./Actions");

const runCommandCreator = (dispatch, options) => {
  const { onData, onError, onDone } = options || {};
  return ({ userId, appId, command, content }) => {
    dispatch(
      Actions.runCommand(
        { userId, appId, command, content },
        {
          onData: output => {
            dispatch(Actions.commandOutput(output));
            if (onData) onData(output);
          },
          onError,
          onDone
        }
      )
    ).then(({ payload }) => dispatch(Actions.addCommand(payload)));
  };
};

const runCommandSyncCreator = (dispatch, options) => {
  const { onData, onError, onDone } = options || {};
  return commands => {
    let i = 0;
    const _onError = log => {
      i = commands.length;
      if (onError) {
        return onError(log);
      }
    };
    const _onDone = log => {
      if (i < commands.length) {
        runCommandCreator(dispatch, {
          onDone: _onDone,
          onError: _onError,
          onData
        })(commands[i++]);
      } else {
        if (onDone) onDone(log);
      }
    };
    _onDone();
  };
};

module.exports = {
  runCommandCreator,
  runCommandSyncCreator
};

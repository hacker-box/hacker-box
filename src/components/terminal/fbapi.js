const getActiveCommands = (
  { userId, appId },
  { onTask, onData, onDone, onError }
) =>
  firebase => {
    const queueRef = firebase.database().ref(`users/${userId}/queue`);
    return queueRef.child("tasks").once("value").then(snap => {
      const tasks = snap ? snap.val() || {} : {};
      return Object.keys(tasks)
        .map(taskId => tasks[taskId])
        .filter(task => task._state === "in_progress")
        .map(task => {
          var bufferRef = firebase.database().refFromURL(task.bufferUrl);
          if (bufferRef) {
            const logRef = bufferRef.child("log");
            logRef.once("value").then(snap => {
              onTask(task, Object.values(snap.val() || {}));
              logRef.on("child_added", snap => {
                const log = snap.val();
                if (onDone && log.action === "exit") {
                  onDone(log);
                }
                if (onError && log.action === "error") {
                  onError(log);
                }
                onData(log);
              });
            });
          }
          return task;
        });
    });
  };

const runCommand = (
  { userId, appId, command, content },
  { onData, onDone, onError }
) =>
  firebase => {
    const queueRef = firebase.database().ref(`users/${userId}/queue`);
    const bufferRef = queueRef.child("buffers").push();
    const id = bufferRef.key;
    const logRef = bufferRef.child("log");
    const taskRef = queueRef.child("tasks").push({
      id,
      bufferUrl: bufferRef.toString(),
      appId,
      command,
      content: content || ""
    });

    taskRef.on("value", snap => {
      const val = snap.val();
      if (val === null || val._state === "error") {
        setTimeout(
          () => {
            taskRef.off();
            logRef.off();
            logRef.remove();
            taskRef.remove();
          },
          1000
        );
      }
    });
    logRef.on("child_added", snap => {
      const log = snap.val();
      if (onDone && log.action === "exit") {
        onDone(log);
      }
      if (onError && log.action === "error") {
        onError(log);
      }
      onData(log);
      // Leave the logs to page refresh will come back to same state.
      // snap.ref.remove();
    });

    return Promise.resolve({ command, id, appId });
  };

module.exports = {
  runCommand,
  getActiveCommands
};

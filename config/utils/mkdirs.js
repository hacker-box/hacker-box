var fs = require('fs');
var pathFn = require('path');

function mkdirs(path) {
  if (fs.existsSync(path)) { return; }

  var parent = pathFn.dirname(path);

  if (!fs.existsSync(parent)) {
    mkdirs(parent);
  }

  fs.mkdirSync(path);
}

module.exports = mkdirs;

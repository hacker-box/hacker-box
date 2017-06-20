var fs = require('fs');
var pathFn = require('path');
var mkdirs = require('./mkdirs');

const STATS_FILENAME = "webpack-stats.json";

function writeStats(stats) {
  var publicPath = this.options.output.publicPath;
  var json = stats.toJson();
  var chunks = json.assetsByChunkName;
  var content = {};

  Object.keys(chunks).forEach(key => {
    var assets = chunks[key];
    if (!Array.isArray(assets)) { assets = [assets]; }

    var chunkContent = {};

    assets.forEach(asset => {
      var extname = pathFn.extname(asset).substring(1);

      if (!chunkContent.hasOwnProperty(extname)) {
        chunkContent[extname] = [];
      }

      chunkContent[extname].push(publicPath + asset);
    });

    content[key] = chunkContent;
  });

  mkdirs(this.options.output.path);
  fs.writeFileSync(pathFn.join(this.options.output.path, STATS_FILENAME), JSON.stringify(content));
}

module.exports = writeStats;

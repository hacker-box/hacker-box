var chalk = require('chalk');

function runAppServer(port, cb) {
  // Start app server
  require('../server')
    .then( server => {
      server.listen(port, () => {
        console.log();
        console.log(chalk.cyan('The App is running at: '+ port));
        console.log();

        if (cb) {
          cb();
        }
      });
    })
}

module.exports = runAppServer

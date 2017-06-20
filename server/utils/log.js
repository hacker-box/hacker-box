const bunyan = require('bunyan');
const name = require('../../package.json').name;

const options = {
  name,
  src: process.env.NODE_ENV !== 'production',
  serializers: bunyan.stdSerializers
};

module.exports = bunyan.createLogger(options);

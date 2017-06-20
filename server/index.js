const express = require('express');
const configure = require('./configure');
const render = require('./render');
const handleError = require('./utils/errors');
const api = require('./api');

const IS_PRODUCTION = "production" === process.env.NODE_ENV;

module.exports = configure(express()).then(server => {

  if (IS_PRODUCTION) {
    // On production, use the public directory for static files
    // This directory is created by webpack on build time.
    server.use(express.static(`${__dirname}/../dist`));
  }

  // Mount api routes, errors are reported as JSON.
  server.use('/api', api, handleError);

  // Render the app server-side and send it as response.
  server.get('/*', render);

  return server;
});

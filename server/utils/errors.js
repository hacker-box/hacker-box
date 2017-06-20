const { ValidationError } = require('express-validation');
const VError = require('verror');
const log = require('./log');

// Inspects an error object to determine the proper status code to use.
const getStatusCodeFromError = err => {
  // CSURF is the middleware we use for CSRF prevention.  On failure to
  // validate it passes an error to next() to indicate an invalid csrf token
  // and said error has a code of EBADCSRFTOKEN
  // See https://github.com/expressjs/csurf/tree/1.9.0
  if (err.code === 'EBADCSRFTOKEN') {
    return 403;
  }
  // Handle validation errors differently, setting the response code to
  // whatever the validation library has chosen.
  if (err instanceof ValidationError) {
    return err.status;
  }

  // Fallback to 500 otherwise.
  return 500;
};

function handleError(err, req, res, next) {
  // Log all errors to stderr.
  // If this is error is using node-verror, then log any additional 'info'
  // that may have been attached to it
  // See https://github.com/joyent/node-verror#verrorinfoerr
  try {
    log.error({ err, info: VError.info(err) }, 'Request Error');

    // Set the status based off the error object, since they are tightly bound.
    res.status(getStatusCodeFromError(err));

    // Only send the message, don't want to leak stack traces or other system
    // info to the client
    res.json({
      message: err.message,
      cause: VError.cause(err),
      info:  VError.info(err)
    });
  } catch(e) {
    log.error(e);
  }

  next()
}

module.exports = handleError;

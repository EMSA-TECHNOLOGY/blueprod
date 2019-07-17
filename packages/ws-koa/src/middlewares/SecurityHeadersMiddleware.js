'use strict';

const helmet = require("koa-helmet");

// Thanh LE

/**
 * This middleware provides some basic security configurations for the headers.
 *
 * @param wsApp   {Object} Web service application.
 */
module.exports = function WsStaticFileServing(wsApp, /* opts */) {
  if (wsApp.config.get('http.security.helmet', true) === false) {
    /* Ignored */
  } else {
    return helmet();
  }
};

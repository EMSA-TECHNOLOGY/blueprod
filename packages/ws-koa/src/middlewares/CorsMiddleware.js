'use strict';

const cors = require('koa2-cors');
const Koa = require('koa');
const utils = require('@blueprod/common').Utils;

// Thanh LE

module.exports = function CorsMiddleware(wsApp) {
  const corsEnabled = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.HTTP_CORS_ENABLED], true);
  if (corsEnabled) {
    let koaApp = wsApp.app || wsApp;
    if (koaApp && koaApp instanceof Koa) {
      koaApp.use(cors());
    } else {
      wsApp.logger.error(`Cannot enable CORS! invalid Koa app instance!`);
    }
  }
};

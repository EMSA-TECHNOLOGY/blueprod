'use strict';

const utils = require('@blueprod/common').Utils;

module.exports = function WsLogger(wsApp, opts = {}) {
  const traceReq = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.HTTP_TRACE_REQUEST_ENABLED]);
  if (traceReq) {
    const koaApp = wsApp.app;
    const koaLogger = require('koa-logger');
    const logger = require('@blueprod/logger')('ws-koa');

    koaApp.use(koaLogger((str, ...args) => {
      logger.debug(str);
    }));
  }
};

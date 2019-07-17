'use strict';

const utils = require('@blueprod/common').Utils;

// Thanh LE

module.exports = function WsxResponseTime(wsApp /*, opts = {}*/) {
  const xResponseTimeHeaderName = process.env[wsApp.constants.CONFIG_KEYS.HTTP_X_RESPONSE_TIME_HEADER_NAME] || 'X-Response-Time';

  async function xResponseTime(ctx, next) {
    /* Put here to allow dynamic turn on/off this feature */
    const xResponseTime = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.HTTP_X_RESPONSE_TIME_ENABLED], true);
    if (xResponseTime) {
      const start = Date.now();
      /* Support this for external middleware usage in the case */
      ctx._startTime = start;
      await next();
      const ms = Date.now() - start;
      ctx.set(xResponseTimeHeaderName, `${ms}ms`);
    } else {
      return next();
    }
  }

  return xResponseTime;
};

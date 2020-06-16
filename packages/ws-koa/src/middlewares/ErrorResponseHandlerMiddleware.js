'use strict';

const constants = require('../WsConstants');
const Koa = require('koa');

/**
 * This middleware is to handle the response for common error as 400, 404, 500,...
 *
 * @param wsApp
 * @param wsApp.app {Class} koa application
 */
module.exports = function ErrorResponseHandlerMiddleware(wsApp, /* opts */) {

  const fnMiddleware = async function (ctx, next) {
    try {
      await next();
    } catch (err) {
      let status = parseInt(ctx.status);
      let supportedFn = constants.HTTP_RESPONSE_METHODS[status];
      if (supportedFn && typeof ctx[supportedFn] === 'function') {
        return ctx[supportedFn].call(ctx);
      }
    }
  };

  let koaApp = wsApp.app || wsApp;
  if (koaApp && koaApp instanceof Koa) {
    koaApp.use(fnMiddleware);
  }

  return fnMiddleware;
};

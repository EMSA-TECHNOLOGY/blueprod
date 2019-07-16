'use strict';

const cors = require('koa2-cors');
const Koa = require('koa');

// Thanh LE

module.exports = function WsCompress(wsApp) {

  const fnMiddleware = async function (ctx, next) {
    return cors();
  };

  let koaApp = wsApp.app || wsApp;
  if (koaApp && koaApp instanceof Koa) {
    koaApp.use(fnMiddleware);
  }

  return fnMiddleware;
};

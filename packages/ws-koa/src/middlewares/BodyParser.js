'use strict';

/**
 *
 * @param wsApp
 * @param wsApp.logger
 */
module.exports = function WsBodyParser(wsApp) {
  const koaApp = wsApp.app || wsApp;
  const bodyParser = require('koa-bodyparser');
  const logger = wsApp.logger || console;
  koaApp.use(bodyParser(
    {
      enableTypes: ['json', 'form', 'text'],
      onerror: function (err, ctx) {
        logger.error(`Error happened with body parser for web path: ${ctx.url}!`, err);
        // The 422 (Unprocessable Entity) status code means the server understands the content type of the request
        // entity (hence a 415(Unsupported Media Type) status code is inappropriate), and the syntax of the request
        // entity is correct (thus a 400 (Bad Request) status code is inappropriate) but was unable to process the
        // contained instructions.
        ctx.throw('Body content error!', 422);
      }
    }
  ));
  require('koa-qs')(koaApp);
};

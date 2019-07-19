'use strict';

const _ = require('lodash');
const moduleName = require('../../package').name.replace('@blueprod/', '');
const logger = require('@blueprod/logger')(moduleName);

/**
 *
 * For example:
 *
 * @param wsApp
 * @return {*}
 */
module.exports = function mRouteMiddlewareInboundValidator(wsApp /* ws, opts = {}*/) {
  const _mvcRoutes = wsApp.boundMvcRoutes;
  const wsConstants = wsApp.constants;
  const isDebug = wsApp.logger.isDebug;

  return async function mInboundValidator(ctx, next) {
    if (ctx._matchedRoute) {
      let routeKey = `${ctx.method} ${ctx._matchedRoute}`;
      let mvcInfo;
      mvcInfo = _mvcRoutes[routeKey];
      if (!mvcInfo) {
        routeKey = `ALL ${ctx._matchedRoute}`;
        mvcInfo = _mvcRoutes[routeKey];
      }
      if (mvcInfo) {
        //inboundSchemaValidator
        let validator = mvcInfo.inboundSchemaValidator || wsApp.ws.inboundSchemaValidators[routeKey];
        if (validator) {
          let inboundPayload = _.merge(ctx.params || {}, ctx.body || {});
          const valid = validator(inboundPayload);
          if (!valid) {
            ctx.status = wsConstants.STATUS_CODE.BAD_REQUEST;
            ctx.message = 'Invalid request parameters provided!';
            if (isDebug) {
              logger.error(`Invalid Inbound Data [${ctx.url}]: ` +JSON.stringify(inboundPayload));
            }
            return;
          } else {
            ctx.inboundPayload = inboundPayload;
          }
        } else {
          /* do nothing */
        }
      }
    } else {
      wsApp.ws.logger.warn(`Unmatched route: ${ctx.url}`);
    }

    return next();
  }/* mRouteMiddlewareMvcResponseHandler */;
};

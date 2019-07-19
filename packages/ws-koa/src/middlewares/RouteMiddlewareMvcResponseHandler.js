'use strict';


const _ = require('lodash');
const moduleName = require('../../package').name.replace('@blueprod/', '');
const logger = require('@blueprod/logger')(moduleName);

// Thanh LE

/**
 * This middleware is to handle some user actions that does need a controller, for instance, view definition, required
 * authenticated or ...
 *
 * For example:
 *
 * GET /login --> {view: login, layout: frontend, authenticatedRedirect: /secured/dashboard}
 * GET /signup --> {view: signup, authenticatedRedirect: /secured/dashboard}
 * GET /secured/dashboard --> {view: dashboard, layout: dashboard-layout, unauthenticatedRedirect: /login}
 *
 * @param wsApp
 * @return {*}
 */
module.exports = function mRouteMiddlewareMvcResponseHandler(wsApp /* ws, opts = {}*/) {
  const _mvcRoutes = wsApp.boundMvcRoutes;

  return async function mMVCRequestEnhancer(ctx, next) {
    if (ctx._mvc && ctx._mvc.controller) {
      /* Ignored, since there is a user controller */
    } else {
      let mvcInfo = _mvcRoutes[`${ctx.method} ${ctx._matchedRoute}`] || _mvcRoutes[`ALL ${ctx._matchedRoute}`];
      if (mvcInfo && mvcInfo.view && !mvcInfo.fn) {
        /* There is a view definition but without user controller/action */
        if (mvcInfo.authenticatedRedirect && ctx.isAuthenticated()) {
          return ctx.redirect(mvcInfo.authenticatedRedirect);
        } else if (mvcInfo.unauthenticatedRedirect && !ctx.isAuthenticated()) {
          return ctx.redirect(mvcInfo.unauthenticatedRedirect);
        } else {
          if (mvcInfo.layout) {
            return await ctx.render(mvcInfo.view, mvcInfo.data, {layout: mvcInfo.layout})
          } else {
            return await ctx.render(mvcInfo.view, mvcInfo.data)
          }
        }
      } else {
        /* Do nothing */
      }
    }

    return next();
  }/* mRouteMiddlewareMvcResponseHandler */;
};

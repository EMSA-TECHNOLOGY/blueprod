'use strict';


const _ = require('lodash');

// Thanh LE

// This middleware is to enhance the request to support some more parameters served for the MVC model.
// Similar to Sails req.options

/**
 * This middleware is to enhance the request/response/ctx object to support some more parameters served for the MVC model.
 *
 * @param wsApp
 * @return {*}
 */
module.exports = function mRouteMiddlewareMvcEnhancer(wsApp /* ws, opts = {}*/) {
  const _mvcRoutes = wsApp.boundMvcRoutes;

  return async function mMVCRequestEnhancer(ctx, next) {
    const req = ctx.request;
    const res = ctx.response;
    const headers = ctx.req.headers;

    ctx.params = req.params = ctx.params || req.params || {};
    ctx.query = req.query = ctx.query || req.query || {};
    ctx.body = req.body = ctx.body || req.body || {};

    ctx.param = req.param = (p) => {
      return ctx.params[p] || ctx.query[p] || ctx.body[p];
    };

    ctx.allParams = req.allParams = () => {
      return _.merge(ctx.body || {}, ctx.query || {}, ctx.params || {})
    };

    /* Header is always in lower case */
    req.isApiRequest = ctx.isApiRequest = (ctx.headers['x-requested-with']);

    /* Should we support ctx & req.wantsXXX as following? */
    ctx.wantsJSON = req.wantsJSON = ctx.accepts('json');
    // ctx.wantsYAML = req.wantsYAML = ctx.accepts('yaml')||ctx.accepts('x-yaml');
    // ctx.wantsCSV = req.wantsCSV = ctx.accepts('csv');
    // ctx.wantsXML = req.wantsXML = ctx.accepts('xml');
    // ctx.wantsHTML = req.wantsHTML = ctx.accepts('html');

    res.send = (p) => {
      res.ctx.body = p;
    };

    ctx.sendJson = res.json = (obj) => {
      res.ctx.status = 200;
      res.type = wsApp.ws.mimeTypes.lookup('json');
      if (_.isObject(obj)) {
        res.send(JSON.stringify(obj));
      } else if (_.isString(obj)) {
        res.send(obj);
      } else {
        throw new Error('Invalid response data! type: ' +(typeof obj));
      }
    };

    /* Copy some storage options from headers into the body */
    //TODO: TO MOVE TO ANOTHER MIDDLEWARES ?.
    if (ctx.req.method === 'POST' && headers['content-type'] && headers['content-type'].startsWith('multipart/form-data;')) {
      /* is file upload -> get some data */
      ctx.body = ctx.req.body = (ctx.body || ctx.req.body || {});
      for (let p in headers) {
        if (headers.hasOwnProperty(p) && p.startsWith('storage-')) {
          ctx.body[p] = ctx.req.body[p] = headers[p];
        }
      }
    }

    if (ctx._matchedRoute) {
      let ctlInfo = _mvcRoutes[`${ctx.method} ${ctx._matchedRoute}`] || _mvcRoutes[`ALL ${ctx._matchedRoute}`];
      if (ctlInfo) {
        ctx.request.options = ctx.request.options || {};
        _.extend(ctx.request.options, ctlInfo);
        /* Also make an alias to ctx */
        ctx.options = ctx.request.options;
        //TODO: TO WORKAROUND SAILS CONTROLLER
        ctx._mvc = {};
        ctx._mvc.controller = wsApp.controllers[ctlInfo.controllerId];
      } else {
        /* This can be a view definition which does not need a controller */
        // log.warn(`Strange! there is no controller found for matched route: ${ctx._matchedRoute}`);
      }
    }

    return next();
  }/* mMVCRequestEnhancer */;
};

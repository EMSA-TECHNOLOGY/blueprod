/*#*
***************************************************************************************************
** Copyright © 2016 EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** This software is the proprietary information of EMSA TECHNOLOGY COMPANY LTD and ÉOLANE. Unauthorized
** copying of this file, via any medium is strictly prohibited proprietary and confidential.
**
** File:         KoaWebServiceApplication.js
** Version:      0.1
** Author:       <href="mailto:thanhlq@emsa-technology.com"> Thanh LE</a>
**
** Description:
***************
** Server-side Web Service library.
**
** History:
***********
** Version 0.1  2019/07/12 09:00:00  thanhlq @ emsa-technology dot com
**   + Creation and implementation.
***************************************************************************************************
*#*/

'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const _ = require('lodash');
const uuid = require("uuid/v4");
const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const router = Router();
const path = require('path');
const C2K = require('./Koa2Connect');
const common = require('@blueprod/common');
const logger = require('@blueprod/logger')('ws-koa');
const PolicyManager = require('./PolicyManager');

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const constants = require('./WsConstants');

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 * The entry point for instantiating of a server service.
 *
 * @param koaInstance [Optional] koa instance.
 * @param opts  {Object} other options
 * @param opts.port
 * @param opts.logger
 * @param opts.config
 * @param opts.debugger
 * @param opts.middlewares    {[]}
 * @param opts.HTTP_CORS_ENABLED {*} true, "true", TRUE,..
 *
 *
 * @constructor
 */
const KoaWebServiceApplication = function (koaInstance, opts = {}) {
  if (koaInstance !== null && typeof koaInstance === 'object') {
    opts = koaInstance;
    koaInstance = null;
  }
  this.constants = constants;
  this.app = koaInstance || new Koa();
  this.port = opts.port || 21400;
  this.logger = logger;
  this.config = opts.config || require('@blueprod/config').load();
  /* default router */
  this.router = router;
  /* To contain working options */
  this.options = {
    rootAppPath:                        process.env["BLUEPROD_ROOT_APP_PATH"] || global.rootAppPath,
  };

  /* Contain all bound verb-paths */
  this.routeCount = 0;
  this.boundMvcRoutes = {};

  /**
   * Static map of all registered middleware.
   *
   * @type {[]}
   */
  this.middlewares = opts.middlewares || constants.DEFAULT_MIDDLEWARES;
  this.internal_FindRouteMiddlewares();

  /* @see https://github.com/koajs/koa/wiki/Error-Handling */
  this.app.on('error', HandleAppError);
  logger.debug('KoaWebServiceApplication instantiated.');
};

function HandleAppError(err, ctx) {
  /* example 1:
  {
    "errno": "EPIPE",
    "code": "EPIPE",
    "syscall": "write",
    "headerSent": true
  }
  */

  if (err && err.code === 'EPIPE') {
    /* ignore (error writing to pipe - closed pipe) */
  } else if (err.message && err.message === 'Parse Error') {
    logger.debug('Error happened whe handling the request!', err, ctx);
  } else {
    logger.error(`Unknown HTTP error: ` +ctx.path, err);
  }
}

KoaWebServiceApplication.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = KoaWebServiceApplication;

// module.exports = function (koaInstance, opts = {}) {
//   return new KoaWebServiceApplication(koaInstance, opts);
// };

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 * Static method for registering of external middlewares.
 *
 * @param middlewares {[]} Array of middleware (type can be name or functions).
 */
KoaWebServiceApplication.prototype.registerMiddlewares = function (middlewares) {
  if (middlewares && _.isArray(middlewares) && middlewares.length > 0) {
    for (let i = 0; i < middlewares.length; i++) {
      this.bindMiddleware(middlewares[i]);
    }
  } else {
    logger.debug('No middlewares to register!');
  }
};

KoaWebServiceApplication.prototype.bindMiddleware = function (fnMiddleware) {
  const koaApp = this.app;

  if (typeof fnMiddleware === 'string') {
    /* external js module */
    if (path.isAbsolute(fnMiddleware)) {
      fnMiddleware = require(fnMiddleware);
    } else {
      fnMiddleware = require('./middlewares/' +fnMiddleware);
    }
  } else if (typeof fnMiddleware === 'function') {
    /* fine */
  }

  let fnResult;

  try {

    if (fnMiddleware.constructor.name === 'AsyncFunction' && fnMiddleware.length > 1) {
      fnResult = fnMiddleware;
    } else {
      fnResult = fnMiddleware(this);
    }
  } catch (exBindMiddleware) {
    logger.error(`Error when binding middlewares!`, exBindMiddleware);
    throw exBindMiddleware;
  }

  let middlewareName = fnMiddleware.name;
  if (fnResult && _.isFunction(fnResult) /* && fnResult.constructor.name === 'AsyncFunction' */) {
    if (fnResult.length === 2) {
      koaApp.use(fnResult);
      logger.debug(`Added KOA middleware: ${middlewareName}`);
    } else if (fnResult.length === 3) {
      koaApp.use(C2K(fnResult));
      logger.debug(`Added CONNECT middleware: ${middlewareName}`);
    } else {
      throw new Error(`Invalid middleware function! ${middlewareName}`);
    }
  } else {
    logger.debug(`Bound middleware: ${middlewareName}`);
  }
};

KoaWebServiceApplication.prototype.unregisterMiddleware = function (name) {
  this.middlewares = this.middlewares.filter(e => e !== name);
};

KoaWebServiceApplication.prototype.disableCors = function () {

};

/**
 * This function is to find necessary (route) middlewares which all be bound before each user route (i.e. GET /users)
 */
KoaWebServiceApplication.prototype.internal_FindRouteMiddlewares = function() {
  const self = this;
  const envConfig = process.env;
  self.routeMiddlewares = self.routeMiddlewares || [];

  const rmRequestEnhancerEnabled = common.Utils.parseBoolean(envConfig[common.Constants.CONFIG_KEYS.HTTP_MVC_RM_REQUEST_ENHANCER_ENABLED], true);
  /* config: http.policy.enable */
  const rmPolicyEnabled = common.Utils.parseBoolean(envConfig[common.Constants.CONFIG_KEYS.HTTP_MVC_RM_POLICY_ENABLED], true);
  const rmResponseHandlerEnabled = common.Utils.parseBoolean(envConfig[common.Constants.CONFIG_KEYS.HTTP_MVC_RM_RESPONSE_HANDLER_ENABLED], true);
  const rmInboundSchemaValidator = common.Utils.parseBoolean(envConfig[common.Constants.CONFIG_KEYS.HTTP_MVC_RM_INBOUND_SCHEMA_VALIDATOR_ENABLED], true);

  if (rmRequestEnhancerEnabled) {
    /* This middleware is required before going to user route controller action */
    const rmMvcEnhancer = require('./middlewares/RouteMiddlewareMvcEnhancer')(self);
    if (rmMvcEnhancer) {
      self.routeMiddlewares.push(rmMvcEnhancer);
    }
  }

  if (rmPolicyEnabled) {
    /* This middleware is required before going to user route controller action */
    const rmPolicy = require('./middlewares/RouteMiddlewarePolicy')(self);
    if (rmPolicy) {
      self.routeMiddlewares.push(rmPolicy);
    }
  }

  if (rmResponseHandlerEnabled) {
    const rmViewHandler = require('./middlewares/RouteMiddlewareMvcResponseHandler')(self);
    if (rmViewHandler) {
      self.routeMiddlewares.push(rmViewHandler);
    }
  }

  if (rmInboundSchemaValidator) {
    const mInboundSchema = require('./middlewares/RouteMiddlewareInboundValidator')(self);
    if (mInboundSchema) {
      self.routeMiddlewares.push(mInboundSchema);
    }
  }
};

KoaWebServiceApplication.prototype.start = async function (opts = {}) {
  const self = this;
  this.options = _.merge(this.options || {}, opts);
  this.options.port = this.options.port || process.env[common.Constants.CONFIG_KEYS.HTTP_PORT] || 21400;

  /* Step 1: Register middleware */
  this.registerMiddlewares(this.middlewares);

  /* Step 2: Bind mvc route if existed: this.mvcModel.mvcRoutes */
  if (this.mvcModel && this.mvcModel.mvcRoutes) {
    this.bindMvcRoutes(this.mvcModel.mvcRoutes);
  }

  this.app.use(router.routes());

  /* Step 3: Bind mvc open route if existed: this.mvcModel.mvcRoutes */

  /* Step 4: Bind some user's response to ctx */
  /* Load responses ++ */
  const ResponseLoader = require('./ResponseLoader');
  const ctxResponseMethod = await ResponseLoader.load(this.options);
  if (!_.isEmpty(ctxResponseMethod)) {
    for (let p in ctxResponseMethod) {
      if (ctxResponseMethod.hasOwnProperty(p)) {
        self.app.context[p] = ctxResponseMethod[p];
      }
    }
  }

  this.app.listen(this.port);
};

KoaWebServiceApplication.prototype.bindMvcRoutes = function (mvcRoutes) {
  const self = this;
  for (let apiUrl in mvcRoutes) {
    if (!mvcRoutes.hasOwnProperty(apiUrl)) {
      continue;
    }
    let routeInfo = mvcRoutes[apiUrl];
    self.bindMvcRoute(routeInfo.path, mvcRoutes[apiUrl]);
  }

  common.EventManager.emit(constants.EVENTS.ROUTE_ALL_BOUND, self.boundMvcRoutes);
};

/**
 * Bind a single route.
 *
 * @param apiUrl        {String} i.e. GET /users
 * @param routeInfo   {Object}
 * @param routeInfo.controllerId      {String} user (without word "controller")
 * @param routeInfo.action            {String} getUser
 * @param routeInfo.actionId          {String} user.get
 * @param routeInfo.path              {String}  /users
 * @param routeInfo.originalPath      {String}  GET /users
 * @param routeInfo.originalTarget    {*}       i.e. user.getUser
 * @param routeInfo.verb              {String}  i.e. get
 * @param routeInfo.controller        {Object} The controller object (that contain the action
 * @param routeInfo.fn                {Object} The action i.e. async function getUser(ctx, next)
 * @param routeInfo.view              {String} Going to bind view -> controller/action/... shall be ignored.
 *
 */
KoaWebServiceApplication.prototype.bindMvcRoute = function (apiUrl, routeInfo) {
  const self = this;

  const actionId = routeInfo.actionId || (routeInfo.controllerId + '.' + routeInfo.action);
  const verb = routeInfo.verb;
  const bindFunctionName = routeInfo.verb;

  /* Bind the internal route middlewares before user route middlewares */
  /* Note: this should be always bound since it can process the API automatically i.e. view,... */
  if (self.routeMiddlewares && self.routeMiddlewares.length > 0) {
    self[verb](apiUrl, ...self.routeMiddlewares);
  }

  if (!routeInfo.fn && routeInfo.controller && routeInfo.action) {
    routeInfo.fn = routeInfo.controller[routeInfo.action];
  }

  let fn = routeInfo.fn;
  if (fn) {
    /* Try to guess if it's a connect middleware */
    if ((routeInfo.controller && routeInfo.controller.isConnectMiddleware) || (routeInfo.fn && routeInfo.fn.length === 3)) {

      if (Array.isArray(routeInfo.fn)) {
        fn = [];
        routeInfo.fn.forEach((fnTempt) => {
          fn.push(C2K(fnTempt));
        });
      } else {
        fn = C2K(routeInfo.fn);
      }
      logger.debug(`Binding Connect/Express route: [${verb} ${apiUrl}] --> [${actionId}]`);
      // self[bindFunctionName](apiUrl, routeInfo.fn);
    } else {
      logger.debug(`Bound Koa route: [${verb} ${apiUrl}] --> [${actionId}]`);
    }

    // self._bindMvcAction(apiUrl, bindFunctionName, routeInfo);
    /* Start to bind */
    if (routeInfo.controller) {
      router[bindFunctionName](apiUrl, async(ctx, next) => {
        return await fn.call(routeInfo.controller, ctx, next);
      });
    } else {
      router[bindFunctionName](apiUrl, fn);
    }
  }

  self.internal_PutBoundRoute(apiUrl, routeInfo);
  self.routeCount++;
};

KoaWebServiceApplication.prototype.internal_PutBoundRoute = function (apiUrl, routeInfo) {
  /* Incoming request is always with verb in upper case */
  let verb = routeInfo.httpVerb.toUpperCase();
  /* There is NO space */
  this.boundMvcRoutes[`${verb}${apiUrl}`] = routeInfo;
};

KoaWebServiceApplication.prototype.internal_bindRouteMiddleware = function (method, apiUrl, ...next) {
  if (this.routeMiddlewares && this.routeMiddlewares.length > 0) {
    router[method](apiUrl, ...this.routeMiddlewares);
  }
  router[method](apiUrl, ...next);
  logger.debug(`Bound route: [${method}] ${apiUrl}`);
  this.routeCount++;
};

KoaWebServiceApplication.prototype.get = function (apiUrl, ...next) {
  this.internal_bindRouteMiddleware('get', apiUrl, ...next);
  // router.get(apiUrl, ...next);
  return this;
};

KoaWebServiceApplication.prototype.post = function (apiUrl, ...next) {
  this.internal_bindRouteMiddleware('post', apiUrl, ...next);
  return this;
};

KoaWebServiceApplication.prototype.put = function (apiUrl, ...next) {
  this.internal_bindRouteMiddleware('put', apiUrl, ...next);
  return this;
};

KoaWebServiceApplication.prototype.del = function (apiUrl, ...next) {
  this.internal_bindRouteMiddleware('del', apiUrl, ...next);
  return this;
};

KoaWebServiceApplication.prototype.all = function (apiUrl, ...next) {
  this.internal_bindRouteMiddleware('all', apiUrl, ...next);
  return this;
};

/**
 * To support to bind connect/express middleware.
 *
 * @param apiPath
 * @param next
 * @returns {Router}
 */
KoaWebServiceApplication.prototype.cget = function (apiPath, ...next) {
  /* convert connect callback to koa */
  if (next) {
    for (let i = 0; i < next.length; i++) {
      next[i] = C2K(next[i]);
    }
  }

  return router.get(apiPath, ...next);
};

/**
 * To support to bind connect/express middleware.
 * @param apiPath
 * @param next
 * @returns {*}
 */
KoaWebServiceApplication.prototype.cpost = function (apiPath, ...next) {
  /* convert connect callback to koa */
  if (next) {
    for (let i = 0; i < next.length; i++) {
      next[i] = C2K(next[i]);
    }
  }

  return router.post(apiPath, ...next);
};

/**
 * To support to bind connect/express middleware.
 * @param apiPath
 * @param next
 * @returns {*}
 */
KoaWebServiceApplication.prototype.cput = function (apiPath, ...next) {
  /* convert connect callback to koa */
  if (next) {
    for (let i = 0; i < next.length; i++) {
      next[i] = C2K(next[i]);
    }
  }

  return router.put(apiPath, ...next);
};

/**
 * To support to bind connect/express middleware.
 * @param apiPath
 * @param next
 * @returns {*}
 */
KoaWebServiceApplication.prototype.cdel = function (apiPath, ...next) {
  /* convert connect callback to koa */
  if (next) {
    for (let i = 0; i < next.length; i++) {
      next[i] = C2K(next[i]);
    }
  }

  return router.del(apiPath, ...next);
};

/**
 * To support to bind connect/express middleware.
 * @param apiPath
 * @param next
 * @returns {*}
 */
KoaWebServiceApplication.prototype.call = function (apiPath, ...next) {
  /* convert connect callback to koa */
  if (next) {
    for (let i = 0; i < next.length; i++) {
      next[i] = C2K(next[i]);
    }
  }

  return router.all(apiPath, ...next);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

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
  /* To contain working options */
  this.options = {
    rootAppPath:                        process.env["BLUEPROD_ROOT_APP_PATH"] || global.rootAppPath,
  };

  /**
   * Static map of all registered middleware.
   *
   * @type {[]}
   */
  this.middlewares = opts.middlewares || constants.DEFAULT_MIDDLEWARES;

  /* @see https://github.com/koajs/koa/wiki/Error-Handling */
  this.app.on('error', (err, ctx) => {
    /* centralized error handling:
     *   console.log error
     *   write error to log file
     *   save error and request information to database if ctx.request match condition
     *   ...
    */
    HandleAppError(err, ctx);
  });
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

KoaWebServiceApplication.prototype.bindRouteMiddleware = function() {
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
  this.options = _.merge(this.options || {}, opts);
  this.options.port = this.options.port || process.env[common.Constants.CONFIG_KEYS.HTTP_PORT] || 21400;

  /* Step 1: Register middleware */
  this.registerMiddlewares(this.middlewares);

  /* Step 2: Bind mvc route if existed: this.mvcModel.mvcRoutes */

  /* Step 3: Bind mvc open route if existed: this.mvcModel.mvcRoutes */

  /* Step 4: Bind some user's response to ctx */
  /* Load responses ++ */
  const ResponseLoader = require('./ResponseLoader');
  const responses = await ResponseLoader.load(this.options);
  if (!_.isEmpty(responses)) {
    for (let p in responses) {
      if (responses.hasOwnProperty(p)) {
        self.app.context[p] = responses[p];
      }
    }
  }

  this.app.use(router.routes());
  this.app.listen(this.port);
};

KoaWebServiceApplication.prototype.get = (apiPath, ...next) => {
  logger.debug(`Bound [get] route: ${apiPath}`);
  return router.get(apiPath, ...next);
};

KoaWebServiceApplication.prototype.post = (apiPath, ...next) => {
  logger.debug(`Bound [post] route: ${apiPath}`);
  return router.post(apiPath, ...next);
};

KoaWebServiceApplication.prototype.put = (apiPath, ...next) => {
  logger.debug(`Bound [put] route: ${apiPath}`);
  return router.put(apiPath, ...next);
};

KoaWebServiceApplication.prototype.del = (apiPath, ...next) => {
  logger.debug(`Bound [del] route: ${apiPath}`);
  return router.del(apiPath, ...next);
};

KoaWebServiceApplication.prototype.all = (apiPath, ...next) => {
  logger.debug(`Bound [all] route: ${apiPath}`);
  return router.all(apiPath, ...next);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

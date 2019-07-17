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
let C2K = require('./Koa2Connect');
const logger = require('@blueprod/logger')('ws-koa');

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
  for (let i = 0; i < middlewares.length; i++) {
    this.bindMiddleware(middlewares[i]);
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

KoaWebServiceApplication.prototype.start = async function (port) {
  this.port = port || this.port;
  this.registerMiddlewares(this.middlewares);
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

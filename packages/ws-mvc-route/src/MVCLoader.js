/*#*
***************************************************************************************************
** Copyright © 2016 EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** This software is the proprietary information of EMSA TECHNOLOGY COMPANY LTD and ÉOLANE. Unauthorized
** copying of this file, via any medium is strictly prohibited proprietary and confidential.
**
** File:         MVCLoader.js
** Version:      0.1
** Created:      2018/06/05 09:00:00 (GMT+7)
** Author:       <href="mailto:thanhlq@emsa-technology.com"> Thanh LE</a>
**
** Description:
***************
** The purpose of this class is to load all MVC stuffs as api controllers/services/routes/policies/...
**
** History:
***********
** Version 0.1  2018/06/05 09:00:00  thanhlq
**   + Creation and implementation.
***************************************************************************************************
*#*/

/** @module MVCLoader */

'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const _ = require('lodash');
const path = require('path');
const RouteLoader = require('./RouteLoader');
const ControllerLoader = require('./ControllerLoader');
const ServiceLoader = require('./ServiceLoader');
const PolicyLoader = require('./PolicyLoader');
const Verbs = require('./Verbs');
const logger = require('@blueprod/logger')('ws-mvc-route');
const common = require('@blueprod/common');

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const constants = {
  /* To add constants here */
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 *
 * @param wsApp Web Service Application instance. After everything loaded this instance shall have additional the following properties:
 *
 *  - routes: {}
 *  - controllers: {}
 *  - services: {}
 *  - views: {}
 *
 * @constructor
 */
const MVCLoader = function (wsApp) {
  this.wsApp = wsApp;

  this.RouteLoader = RouteLoader;
  this.ControllerLoader = ControllerLoader;
  this.ServiceLoader = ServiceLoader;
  this.PolicyLoader = PolicyLoader;

  /* For containing of loaded controllers, routes, services, views,... */
  this.mvcModel = {
    routes: {},
    controllers: {},
    services: {},
    views: {},
  };
};

MVCLoader.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = MVCLoader;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 *
 * @param options
 * @param options.rootAppPath       {String} Required
 * @param options.loadRoute
 * @param options.loadController
 * @param options.loadService
 * @param options.loadPolicy
 * @param options.makeServiceGlobal  {Boolean}
 * @param options.logger
 *
 * @return {Promise.<string>}
 */
MVCLoader.prototype.load = async function (options) {
  // const self = this;
  // const log = opts.logger || console;
  const opts = _.merge(options || {}, common.Constants.MVC_DEFAULT_OPTIONS);

  this.logger = opts.logger || console;
  let loadRoute = _.isUndefined(opts.loadRoute) ? true : opts.loadRoute;
  let loadController = _.isUndefined(opts.loadController) ? true : opts.loadController;
  let loadService = _.isUndefined(opts.loadService) ? true : opts.loadService;
  let loadPolicy = _.isUndefined(opts.loadPolicy) ? true : opts.loadPolicy;

  if (!opts.rootAppPath) {
    opts.rootAppPath = global.rootAppPath || process.env["BLUEPROD_ROOT_APP_PATH"] || path.resolve(__dirname).split('/node_modules')[0];
  }

  if (loadRoute) {
    await this.loadRoutes(opts);
  }

  if (loadController) {
    await this.loadControllers(opts);
  }

  if (loadService) {
    opts.makeServiceGlobal = opts.makeServiceGlobal || common.Utils.parseBoolean(process.env[common.Constants.CONFIG_KEYS.MVC_MAKE_SERVICE_GLOBAL]);
    opts.makeServiceGlobal = opts.makeServiceGlobal !== undefined ? opts.makeServiceGlobal : common.Constants.CONFIG_KEYS.MVC_MAKE_SERVICE_GLOBAL_DEFAULT
    await this.loadServices(opts);
  }

  if (loadPolicy) {
    await this.loadPolicies(opts);
  }

  // this.mvcModel.mvcRoutes = this.buildMvcRoutes(this.mvcModel.routes, this.mvcModel.controllers);

  if (this.wsApp) {
    _.extend(this.wsApp, this.mvcModel);
  }

  return this.mvcModel;
};

/**
 * This function is to build the mapping between route and controller action.
 *
 * @return {Object} {path, actionInfo} -> {'GET /users', {actionInfo}}
 */
MVCLoader.prototype.buildMvcRoutes = function (routes, controllers) {
  const builtRoutes = {};

  for (let path in routes) {
    if (!routes.hasOwnProperty(path)) {
      continue;
    }

    let targets = routes[path];
    let args = sanitize(path, targets);
    let httpVerb = args.verb || 'ALL';
    let verb = Verbs.userVerb2KoaVerb(args.verb || 'ALL');

    const builtTarget = this.parseRouteTarget(path, targets, controllers);

    if (builtTarget) {
      builtTarget.verb = verb;
      builtTarget.path = args.path;
      builtTarget.verb = verb;
      builtTarget.originalPath = path;
      builtTarget.httpVerb = httpVerb;
      builtRoutes[`${verb.toUpperCase()} ${args.path}`] = builtTarget;
    }
  }

  return builtRoutes;
};

/**
 * For example: 'UserController.createUser'
 */
MVCLoader.prototype.parseAction = function (action) {
  if (action && _.isString(action) && action.indexOf('.') > 0) {
    action = action.trim();
    let parts = action.split('.');
    let result = {
      action: parts[1],
      controllerId : parts[0].toLowerCase().replace('controller', ''),
    };
    result.actionId = result.controllerId +'.' +result.action.toLowerCase();

    return result;
  }

  return {};
};

/**
 * Parse a user route definition (path, target).
 *
 * @param routePath     {String}  The user route path i.e. "GET /users"
 * @param target        {*}       Can be various as "Controller.action", "users/action", object type as {view: "user.ejs", layout: "user-profile.ejs"}.
 * @param controllers   {Object}  The needed controller object (<controllerId, controllerObject>), Needed in the case the target is controller/action.
 *
 * @return {*}    The parsed MVC route object that contains all needed information for binding.
 */
MVCLoader.prototype.parseRouteTarget = function (routePath, target, controllers) {
  const self = this;

  const targetInfo = {
    /* may be:
      - controllerId, action (fn name), actionId
      - view, layout
      - fn (handler function)
     */
    originalTarget : target
  };

  if (_.isString(target)) {
    /* e.g. user.authenticate */
    if (target.indexOf('.') > 0) {
      // const controllerAction = target.split(".");
      // const controllerId = controllerAction[0].toLowerCase().replace('controller', '');
      // const action = controllerAction[1];
      // const actionId = `${controllerId}.${action}`;

      _.extend(targetInfo, self.parseAction(target));
      const controller = controllers[targetInfo.controllerId];

      if (!controller) {
        self.logger.error(`Controller is not found: ${targetInfo.controllerId}, ignored route: ${routePath}!`);
        return false;
        /* parse fail */
      }

      targetInfo.fn = controller[targetInfo.action];

      if (!targetInfo.fn) {
        self.logger.error(`Controller action is not found: ${targetInfo.action}, ignored route: ${routePath}!`);
        return false;
        /* parse fail */
      }

      // targetInfo.action = action;
      // targetInfo.controllerId = controllerId;
      // targetInfo.actionId = actionId;
      targetInfo.controller = controller;
    } else {
      logger.error('Ingored unknown route target: ' + target);
    }
  } else if (_.isArray(target)) {
    /* Rarely... to be supported later */
    self.logger.error(`Unsupported route target array type, ignored route: ${routePath}!`);
    return false;
  } else if (_.isObject(target)) {
    _.extend(targetInfo, target);

    /* For example: UserController.createUser */
    if (target.action && _.isString(target.action) && target.action.indexOf('.') > 0) {
      _.extend(targetInfo, self.parseAction(target.action));
    }

    if (target.view) {
      /* do nothing */
    } else if (target.fn) {
      if (!_.isFunction(target.fn)) {
        self.logger.error(`Invalid user response handler - the handler must be a function type, ignored route: ${routePath}!`);
        return false;
      } else {
        /* do nothing since, user defined directly an action */
      }
    } else if (target.action) {
      // targetInfo.controllerId = target.controller.toLowerCase().replace('controller', '');
      targetInfo.controllerId = targetInfo.controllerId || target.controller.toLowerCase().replace('controller', '');
      targetInfo.controller = controllers[targetInfo.controllerId];
      if (!targetInfo.controller) {
        self.logger.error(`Controller is not found: ${target.controller}, ignored route: ${routePath}!`);
        return false;
        /* parse fail */
      }
      targetInfo.fn = targetInfo.controller[targetInfo.action];
      if (!targetInfo.fn) {
        self.logger.error(`Controller action is not found: ${target.action}, ignored route: ${routePath}!`);
        return false;
        /* parse fail */
      }
      targetInfo.actionId = targetInfo.actionId || (targetInfo.controllerId +'.' +targetInfo.action.toLowerCase());
    } else {
      self.logger.error(`Invalid route target definition: ${JSON.stringify(target)}, ignored route: ${routePath}!`);
      return false;
    }
  } else if (_.isFunction(target)) {
    targetInfo.fn = target;
  } else {
    self.logger.error(`Invalid route target definition type: ${typeof target}, ignored route: ${routePath}!`);
    return false;
  }

  return targetInfo;
};

MVCLoader.prototype.loadRoutes = async function (opts) {
  const loader = new RouteLoader();
  const route = await loader.load(opts);
  if (!_.isEmpty(route)) {
    this.mvcModel.routes = _.merge(this.mvcModel.routes || {}, route);
  }
  return route;
};

MVCLoader.prototype.loadControllers = async function (opts) {
  const loader = new ControllerLoader();
  const controllers = await loader.load(opts);
  if (!_.isEmpty(controllers)) {
    this.mvcModel.controllers = _.merge(this.mvcModel.controllers || {}, controllers);
  }
  return controllers;
};

MVCLoader.prototype.loadServices = async function (opts) {
  const loader = new ServiceLoader();
  const services = await loader.load(opts);
  if (!_.isEmpty(services)) {
    this.mvcModel.services = _.merge(this.mvcModel.services || {}, services);
  }
  return services;
};

MVCLoader.prototype.loadPolicies = async function (opts) {
  const loader = new PolicyLoader();
  const policies = await loader.load(opts);
  if (!_.isEmpty(policies)) {
    this.mvcModel.policies = _.merge(this.mvcModel.policies || {}, policies);
  }
  return policies;
};

const verbExpr = /^(all|get|post|put|delete|trace|options|connect|patch|head)\s+/i;

function detectVerb(haystack) {
  let verbSpecified = _.last(haystack.match(verbExpr) || []) || '';

  verbSpecified = verbSpecified.toLowerCase();

  // If a verb was specified, eliminate the verb from the original string
  if (verbSpecified) {
    haystack = haystack.replace(verbExpr, '');
  }

  return {
    verb: verbSpecified,
    original: haystack,
    path: haystack
  };
}

function sanitize(path, target, verb, options) {
  options = options || {};

  // If trying to bind '*', that's probably not what was intended, so fix it up
  path = path === '*' ? '/*' : path;

  // If route has an HTTP verb (e.g. `get /foo/bar`, `put /bar/foo`, etc.) parse it out,
  const detectedVerb = detectVerb(path);
  // then prune it from the path
  path = detectedVerb.original;
  // Keep track of parsed verb so we know if it was specified later
  options.detectedVerb = detectedVerb;

  // If a verb override was not specified,
  // use the detected verb from the string route
  if (!verb) {
    verb = detectedVerb.verb;
  }

  return {
    path: path,
    target: target,
    verb: verb,
    options: options
  };
}

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘


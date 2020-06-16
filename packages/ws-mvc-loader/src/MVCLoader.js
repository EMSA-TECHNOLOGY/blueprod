/** @module MVCLoader */

'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const _ = require('lodash');
const path = require('path');
const swaggerSpecGen = require('swagger-jsdoc');

const logger = require('@blueprod/logger')('ws-mvc-loader');
const common = require('@blueprod/common');

const RouteLoader = require('./RouteLoader');
const ControllerLoader = require('./GlobControllerLoader');
const ServiceLoader = require('./ServiceLoader');
const PolicyLoader = require('./PolicyLoader');
const RawRouteToMvcRoute = require('./RawRouteToMvcRoute');

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
 * @param [wsApp] Web Service Application instance. After everything loaded this instance shall have additional the following properties:
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

  /* For containing of loaded controllers, routes, services, views,... */
  this.mvcModel = {
    routes: {},
    controllers: {},
    services: {},
    views: {},
  };
};

/*
 * Statically export Classes below to outside.
 */
MVCLoader.RouteLoader = RouteLoader;
MVCLoader.ControllerLoader = ControllerLoader;
MVCLoader.ServiceLoader = ServiceLoader;
MVCLoader.PolicyLoader = PolicyLoader;
MVCLoader.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 * @type {MVCLoader}
 */
module.exports = MVCLoader;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 * Start to find user's defined routes. All options are enabled by default.
 *
 * @param params                   {*}
 * @param params.rootAppPath       {String} Required
 * @param params.loadRoute
 * @param params.loadRouteFromSwaggerDoc {Boolean} Load routes from swagger doc definition (see swagger-jsdoc module for details)
 * @param params.buildMvcRoutes          {Boolean} To build policy
 * @param params.loadController
 * @param params.loadService
 * @param params.loadPolicy
 * @param params.makeServiceGlobal  {Boolean}
 * @param params.logger
 *
 * @return {Promise.<string>}
 */
MVCLoader.prototype.load = async function (params) {
  /* api path */
  if (typeof params === 'string') {
    const rootAppPath =  params;
    params = {};
    params.rootAppPath = rootAppPath;
  }
  const opts = _.merge(params || {}, common.Constants.MVC_CONSTANTS.MVC_DEFAULT_OPTIONS);

  this.logger = opts.logger || logger;
  opts.logger = this.logger;
  const loadRoute = _.isUndefined(opts.loadRoute) ? true : opts.loadRoute;
  const loadRouteFromSwaggerDoc = _.isUndefined(opts.loadRouteFromSwaggerDoc) ? true : opts.loadRouteFromSwaggerDoc;
  const loadController = _.isUndefined(opts.loadController) ? true : opts.loadController;
  const loadService = _.isUndefined(opts.loadService) ? true : opts.loadService;
  const loadPolicy = _.isUndefined(opts.loadPolicy) ? true : opts.loadPolicy;
  const buildMvcRoutes = _.isUndefined(opts.buildMvcRoutes) ? true : opts.buildMvcRoutes;

  if (!opts.rootAppPath) {
    opts.rootAppPath = global.rootAppPath || process.env["BD_ROOT_APP_PATH"] || path.resolve(__dirname).split('/node_modules')[0];
  }

  if (loadRoute) {
    const resultRoute = await this.loadRoutes(opts);
    if (!_.isEmpty(resultRoute.routes)) {
      this.mvcModel.rawRoutes = _.merge(this.mvcModel.rawRoutes || {}, resultRoute.routes);
    }

    this.mvcModel.routeFiles = resultRoute.routeFiles || [];
  }

  if (loadController) {
    const {controllers, controllerFiles} = await this.loadControllers(opts);
    if (!_.isEmpty(controllers)) {
      this.mvcModel.controllers = _.merge(this.mvcModel.controllers || {}, controllers);
    }
    if (!_.isEmpty(controllerFiles)) {
      this.mvcModel.controllerFiles = _.merge(this.mvcModel.controllerFiles || [], controllerFiles);
    }
  }

  /* Must have mvcModel.controllerFiles */
  if (loadRouteFromSwaggerDoc && this.mvcModel.controllerFiles && this.mvcModel.controllerFiles.length > 0) {
    // You can set every attribute except paths and swagger
    // https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md
    const swaggerDefinition = {
      openapi: '3.0.0',
      info: {
        // API information (required)
        title: 'EMSA TECHNOLOGY :: blueprod APIs', // Title (required)
        version: require('../package').version, // Version (required)
        // description: 'A sample API', // Description (optional)
      },
      servers: [{
        url: 'http://localhost:21400/',
        description: 'localhost port 21400'
      }]
    };

    const options = {
      /* options.definition could be also options.swaggerDefinition */
      definition: swaggerDefinition,
      /* Path to the API docs, Note that this path is relative to the current directory from which the Node.js is ran, not the application itself. */
      apis: this.mvcModel.controllerFiles,
    };
    try {
      this.mvcModel.openApiSpec = swaggerSpecGen(options);
    } catch (ex) {
      logger.error(`Error when generating OpenAPI spec from controller jsdoc`, ex);
      throw ex;
    }
  }

  if (loadService) {
    opts.makeServiceGlobal = opts.makeServiceGlobal || common.Utils.parseBoolean(process.env[common.Constants.CONFIG_KEYS.MVC_MAKE_SERVICE_GLOBAL]);
    opts.makeServiceGlobal = opts.makeServiceGlobal !== undefined ? opts.makeServiceGlobal : common.Constants.MVC_CONSTANTS.MVC_MAKE_SERVICE_GLOBAL_DEFAULT;
    await this.loadServices(opts);
  }

  if (loadPolicy) {
    await this.loadPolicies(opts);
  }

  if (buildMvcRoutes && !_.isEmpty(this.mvcModel.rawRoutes)) {
    this.mvcModel.mvcRoutes = RawRouteToMvcRoute(this.mvcModel.rawRoutes, this.mvcModel.controllers);
  } else {
    logger.debug('Ignored MVC routes building!');
  }

  if (this.wsApp) {
    if (!this.wsApp.mvcModel) {
      this.wsApp.mvcModel = _.clone(this.mvcModel);
    } else {
      _.extend(this.wsApp.mvcModel, this.mvcModel);
    }
  }

  return this.mvcModel;
};

MVCLoader.prototype.loadRoutes = async function (opts) {
  const loader = new RouteLoader();
  return await loader.load(opts);
};

MVCLoader.prototype.loadControllers = async function (opts) {
  const loader = new ControllerLoader();
  return await loader.load(opts);
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

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

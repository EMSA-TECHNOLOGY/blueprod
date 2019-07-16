'use strict';

const commonConstants = require('@blueprod/common').Constants;

const HTTP_OPTIONS_DEFAULT = {
  port: process.env.HTTP_PORT || 21400,
  /* '0.0.0.0' -> all interfaces */
  /* bind on LOCAL interface */
  // host: process.env.HTTP_HOST || '127.0.0.1',
  host: process.env.HTTP_HOST || '0.0.0.0',
};

const HTTPS_OPTIONS_DEFAULT = {
  port: process.env.HTTPS_PORT || 443,
  /* '0.0.0.0' -> all interfaces */
  /* Should be the local server IP address */
  /* bind on LOCAL interface */
  host: process.env.HTTPS_HOST || '127.0.0.1'
};

const CONFIG_KEYS = Object.freeze({
  'HTTP_TRACE_REQUEST_ENABLED':         `${commonConstants.CONFIG_PREFIX}_HTTP_TRACE_REQUEST_ENABLED`,
  'HTTP_TRACE_REQUEST_PRETTY':          `${commonConstants.CONFIG_PREFIX}_HTTP_TRACE_REQUEST_PRETTY`,
  'HTTP_TRACE_REQUEST_DETAIL_ENABLED':  `${commonConstants.CONFIG_PREFIX}_HTTP_TRACE_REQUEST_DETAIL_ENABLED`,
  'HTTP_TRACE_RESPONSE_ENABLED':        `${commonConstants.CONFIG_PREFIX}_HTTP_TRACE_RESPONSE_ENABLED`,
  'HTTP_CORS_ENABLED':                  `${commonConstants.CONFIG_PREFIX}_HTTP_CORS_ENABLED`,
  'HTTP_STATIC_FILE_SERVING_ENABLED':   `${commonConstants.CONFIG_PREFIX}_HTTP_STATIC_FILE_SERVING_ENABLED`,
  'HTTP_COMPRESS_ENABLED':              `${commonConstants.CONFIG_PREFIX}_HTTP_COMPRESS_ENABLED`,
  /* i.e. ejs or ... */
  'VIEW_DEFAULT_TYPE':                  `${commonConstants.CONFIG_PREFIX}VIEW_DEFAULT_TYPE`,
  /* i.e. debug ejs/... template engine */
  'VIEW_DEBUG_ENABLED':                  `${commonConstants.CONFIG_PREFIX}_VIEW_DEBUG_ENABLED`,
  'VIEW_CACHE_ENABLED':                  `${commonConstants.CONFIG_PREFIX}_VIEW_CACHE_ENABLED`,
  /* view */
  'VIEW_DIR_NAME':                      `${commonConstants.CONFIG_PREFIX}_VIEW_DIR_NAME`,
  /* .ejs */
  'EJS_EXTENSION_DEFAULT':              `${commonConstants.CONFIG_PREFIX}_EJS_EXTENSION_DEFAULT`,
});

const EVENTS = {
  /* Before loading of route files */
  SESSION_NEW: 'session:new',
  SESSION_DESTROYED: 'session:destroyed',
  ROUTE_BOUND: 'route:bound',
  /* After all loaded routes are already bound */
  ROUTE_ALL_BOUND: 'route:all:bound',
  WS_SERVER_STARTED: 'ws:server:started',
};

/**
 * All supported middlewares must be in this list.
 *
 * @type {[string]}
 */
const DEFAULT_MIDDLEWARES = [
  'ErrorResponseHandlerMiddleware',
  'xResponseTime',
  'StaticFileServing',
  'SecurityHeadersMiddleware.js',
  'CorsMiddleware',
  'BodyParser',
  'RequestLogger',
  'RequestDetailedLogger',
  'SessionMiddleware',
  'AuthenticationMiddleware',
  /* Still facing with problem of supporting of ejs include/partial */
  /* And this one is more compatible with express */
  // 'ViewMiddleware',
  'CompressMiddleware',
  'ViewEjsMiddleware',
];

const WEBSERVICE_APP_DEFAULT_OPTIONS = {
  /*glob patter */
  // routeFiles: ['/config/routes.js'],
  /* Auto detected in config.routes first -> don't need to provide the file here */
  routeFiles: ['/config/routes.js'],
  controllerDirs: ['api/controllers'],
  serviceDirs: ['api/services'],
  hookDirs: ['api/hooks'],
  policyDirs: ['api/policies'],
  responseDirs: ['api/responses'],
  loadControllerRecursive: true,
  loadServiceRecursive: true,
  middlewares: DEFAULT_MIDDLEWARES
};

const WS_HOOKS = {
  /* Before loading of route files */
  ROUTE_BEFORE: 'route:before',
  ROUTE_AFTER: 'route:after',
  CONTROLLER_BEFORE: 'controller:before',
  CONTROLLER_AFTER: 'controller:after',
  SERVICE_BEFORE: 'service:before',
  SERVICE_AFTER: 'service:after',
  HOOK_BEFORE: 'hook:before',
  HOOK_AFTER: 'hook:after',
};

const WS_MIDDLEWARE_ENABLED_NAME = {
  RESPONSE_HANDLER: 'http.responseHandler.enabled',
  VIEW_HANDLER:     'http.viewHandler.enabled'
};

const ACCEPT_TYPES = {
  JSON:     'application/json',
  XML:      'application/xml',
  YAML:     'application/x-yaml',
  HAL_JSON: 'application/hal-json',
  HTML:     'text/html'
};

const REQUEST_HEADER_KEYS = {
  XHR_REQUEST_KEY : 'X-Requested-With'
};

/**
 * Supported the mapping between status code and http response method (functions).
 *
 * This facility is to allow user to implement correspondent method to resolve http error (code).
 *
 * @type {{}}
 */
const HTTP_RESPONSE_METHODS = {
  '400': 'badRequest',
  '403': 'forbidden',
  '404': 'notFound',
  '500': 'serverError',
};

module.exports = {
  CONFIG_KEYS:                          CONFIG_KEYS,
  HTTP_OPTIONS_DEFAULT:                 Object.freeze(HTTP_OPTIONS_DEFAULT),
  HTTPS_OPTIONS_DEFAULT:                Object.freeze(HTTPS_OPTIONS_DEFAULT),
  STATUS_CODE:                          require('./StatusCodes'),
  ACCEPT_TYPES:                         Object.freeze(ACCEPT_TYPES),
  REQUEST_HEADER_KEYS:                  Object.freeze(REQUEST_HEADER_KEYS),
  // MIDDLEWARE_ENABLED_NAME:              WS_MIDDLEWARE_ENABLED_NAME,
  WEB_PUBLIC_PATH:                      '.tmp/public',

  EVENTS:                               Object.freeze(EVENTS),
  DEFAULT_MIDDLEWARES:                  Object.freeze(DEFAULT_MIDDLEWARES),
  WEBSERVICE_APP_DEFAULT_OPTIONS:       Object.freeze(WEBSERVICE_APP_DEFAULT_OPTIONS),
  HOOKS:                                Object.freeze(WS_HOOKS),

  VIEW: Object.freeze({
    /* To enable the view middleware */
    VIEW_ENABLED_CK:                    'http.view.enabled',
    /* i.e. [{'.ejs': 'ejs'}] */
    VIEW_ENGINES_ENABLED:               'http.view.enabled_engines',
    /* The directory contains the view files */
    VIEW_DIRECTORY_CK:                  'http.view.dir',
    /* The default extension when the extension is not provided */
    EXTENSION_DEFAULT_CK:               'http.view.extension.default',
  }),

  HTTP_RESPONSE_METHODS:                HTTP_RESPONSE_METHODS
};

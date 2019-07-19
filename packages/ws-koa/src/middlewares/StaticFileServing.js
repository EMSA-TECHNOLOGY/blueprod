'use strict';

const path = require('path');
const utils = require('@blueprod/common').Utils;

/**
 *
 * @param wsApp   {Object} Web service application.
 */
module.exports = function WsStaticFileServing(wsApp, /* opts */) {
  const config = wsApp.config;
  const rootAppPath = wsApp.options.rootAppPath || config.rootAppPath;
  const rootWebPath = process.env[wsApp.constants.CONFIG_KEYS.HTTP_ROOT_WEB_PATH] || path.join(rootAppPath, wsApp.constants.WEB_PUBLIC_PATH_DEFAULT);
  const staticFile = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.HTTP_STATIC_FILE_SERVING_ENABLED]);

  if (!staticFile) {
    /* Ignored */
  } else {

    const koaApp = wsApp.app;

    /* Static file serving */
    let opts = {
      maxage  : 0,              /* Browser cache max-age in milliseconds. defaults to 0 */
      hidden  : false,          /* Allow transfer of hidden files. defaults to false */
      index   : 'index.html',   /* Default file name, defaults to 'index.html' */
      defer   : false,          /* If true, serves after return next(), allowing any downstream middleware to respond first. */
      gzip    : true,           /* Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested file with .gz extension exists. defaults to true. */
    };

    koaApp.use(require('koa-favicon')(path.join(rootWebPath, 'favicon.ico')));
    koaApp.use(require('koa-static')(rootWebPath, opts));
    const conditional = require('koa-conditional-get');
    const etag = require('koa-etag');
    /* etag works together with conditional-get */
    koaApp.use(conditional());
    koaApp.use(etag());
  }
};

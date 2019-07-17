/*#*
***************************************************************************************************
** Copyright © 2016 EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** This software is the proprietary information of EMSA TECHNOLOGY COMPANY LTD and ÉOLANE. Unauthorized
** copying of this file, via any medium is strictly prohibited proprietary and confidential.
**
** File:         RouteLoader.js
** Version:      0.1
** Created:      2018/06/05 09:00:00 (GMT+7)
** Author:       <href="mailto:thanhlq@emsa-technology.com"> Thanh LE</a>
**
** Description:
***************
** Server-side Web Service library.
**
** History:
***********
** Version 0.1  2018/06/05 09:00:00  thanhlq
**   + Creation and implementation.
***************************************************************************************************
*#*/

'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const ROUTE_FILE_NAME_DEFAULT = 'routes.js';
let debug = require('debug')('ws-mvc-route');

/**
 *
 * @class
 * @constructor
 *
 * @param opts
 */
const RouteLoader = function (opts = {}) {
  this.opts = opts;
};

module.exports = RouteLoader;

/**
 * This shall load defined routes from /config/routes.js (sails compatibility).
 *
 * @param opts
 * @param opts.rootAppPath  {String} The root application path for finding of resources.
 * @param opts.logger
 * @param opts.routeFiles {[String]} glob pattern for find files or absolute file.
 * @return {Promise.<{}>}
 */
RouteLoader.prototype.load = async (opts) => {
  opts = opts || this.opts || {};
  const rootAppPath = opts.rootAppPath || process.env['BLUEPROD_ROOT_APP_PATH'];
  const configDirName = process.env['BLUEPROD_CONFIG_DIR_NAME'] || 'config';
  let routeFiles = opts.routeFiles || ['*routes*'];
  let foundRoutes = {};

  if (!rootAppPath) {
    throw new Error('Cannot load route files, root application path is not provided!');
  }

  routeFiles = (Array.isArray(routeFiles) ? routeFiles : [routeFiles]);
  for (let i = 0; i < routeFiles.length; i++) {
    let providedRouteFile = routeFiles[i];
    let routeFileFullPath;

    if (!path.isAbsolute(providedRouteFile)) {
      routeFileFullPath = path.join(rootAppPath, configDirName, providedRouteFile);
    } else {
      routeFileFullPath = providedRouteFile;
    }

    if (fs.existsSync(routeFileFullPath) && fs.lstatSync(routeFileFullPath).isDirectory()) {
      routeFileFullPath = path.join(routeFileFullPath, ROUTE_FILE_NAME_DEFAULT);
    }

    const foundRouteFiles = glob.sync(routeFileFullPath, {nodir: true});
    for (let r = 0; r < foundRouteFiles.length; r++) {
      let foundRouteFile = foundRouteFiles[r];
      debug('Found route file: ' +foundRouteFile);
      const ext = path.extname(foundRouteFile);
      if (ext === '.js' || ext === '.json' || ext === '.yaml') {
        let routes;
        if (ext === '.js' || ext === '.json') {
          routes = require(foundRouteFile);
        } else {
          const yaml = require('js-yaml');
          routes = yaml.safeLoad(foundRouteFile);
        }

        if (routes && _.isObject(routes)) {
          routes = routes.routes || routes;
          foundRoutes = _.merge(foundRoutes, routes);
        } else {
          debug('No routes defined in file: ' +foundRouteFile);
        }
      } else {
        /* ignored this file */
        debug('Ignored route file: ' +foundRouteFile);
      }
    }
  }
  return foundRoutes;
};

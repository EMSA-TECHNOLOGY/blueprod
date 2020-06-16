'use strict';

const path = require('path');
const fileFinder = require('./FileFinder');
const logger = require('@blueprod/logger')('ws-mvc-loader');

/**
 * Class to load API all provided controllers.
 *
 * @class
 * @constructor
 */
const ServiceLoader = function () {};

module.exports = ServiceLoader;

/**
 * This shall load all services available under defined service directories (opts.serviceDirs).
 *
 * @param opts
 * @param opts.rootAppPath  {String} The root application path for finding of resources.
 * @param opts.logger
 * @param opts.serviceDirs
 * @param opts.makeServiceGlobal
 *
 * @return {Promise.<{Object}>}
 */
ServiceLoader.prototype.load = async (opts = {}) => {
  const rootAppPath = opts.rootAppPath;
  const foundObjects = {};
  let dirs = opts.serviceDirs || ['api/services'];
  dirs = (Array.isArray(dirs) ? dirs : [dirs]);
  const makeServiceGlobal = opts.makeServiceGlobal || false;

  if (!rootAppPath) {
    throw new Error('Root application path is not provided!');
  }

  logger.info(`Make service global: ` +makeServiceGlobal);

  for (let i = 0; i < dirs.length; i++) {
    let tempDir = dirs[i];
    let fullDir;

    if (path.isAbsolute(tempDir)) {
      fullDir = tempDir;
    } else {
      fullDir = path.join(rootAppPath, tempDir);
    }

    logger.debug(`Loading services in: ${fullDir}`);

    const services = [];
    fileFinder.findFileSync(fullDir, services, {extensions: ['.js']});
    services.forEach((s) => {
      s = path.resolve(s);
      let serviceName = path.basename(s).replace('.js', '');
      serviceName = serviceName.replace(/[^\w\s]/gi, '');
      const serviceObject = require(s);
      if (makeServiceGlobal) {
        global[serviceName] = serviceObject;
      }
      foundObjects[serviceName] = serviceObject;
    });
  }

  return foundObjects;
};

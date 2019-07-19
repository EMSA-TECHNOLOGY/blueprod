'use strict';

const path = require('path');
const utils = require('@blueprod/common').Utils;
const config = require('@blueprod/config');
const logger = require('@blueprod/logger')('ws-koa');

/**
 * Class to load API all provided controllers.
 *
 * @class
 * @constructor
 */
const ResponseLoader = function () {
};

module.exports = ResponseLoader;

/**
 * This shall load all responses available under defined response directories (opts.responseDirs).
 *
 * @param opt
 * @param opt.responseDirs
 * @param opt.rootAppPath
 *
 *
 * @return {Promise.<{Object}>}
 */
ResponseLoader.load = async (opt = {}) => {
  let foundObjects = {};
  let dirs = opt.responseDirs || ['api/responses'];
  dirs = (Array.isArray(dirs) ? dirs : [dirs]);

  for (let i = 0; i < dirs.length; i++) {
    let tempDir = dirs[i];
    let fullDir;

    if(path.isAbsolute(tempDir)) {
      fullDir = tempDir;
    } else {
      fullDir = path.join(opt.rootAppPath, tempDir);
    }

    if (utils.isExistedFileSync(fullDir)) {
      logger.debug('Loading context (ctx) responses in: ' + fullDir);

      let services = [];
      utils.findFilesSync(fullDir, services, {extensions: ['.js']});
      services.forEach((s) => {
        try {
          let serviceName = path.basename(s).replace('.js', '').removeSpecialCharacters().removeSpecialCharacters();
          foundObjects[serviceName] = require(s);
        } catch (eLoadService) {
          logger.error(`Error when loading API response!`, eLoadService);
          throw eLoadService;
        }
      });
    }
  }

  return foundObjects;
};

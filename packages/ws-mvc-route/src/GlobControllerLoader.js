/*#*
***************************************************************************************************
** Copyright © 2016 EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** This software is the proprietary information of EMSA TECHNOLOGY COMPANY LTD and ÉOLANE. Unauthorized
** copying of this file, via any medium is strictly prohibited proprietary and confidential.
**
** File:         ControllerLoader.js
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

const COMPONENT_NAME = 'ControllerLoader';

// const _ = require('lodash');
// const util = require('util');
const path = require('path');
const glob = require('glob');

/**
 * Class to load API all provided controllers.
 *
 * @class
 * @constructor
 */
const ControllerLoader = function (opts) {
  this.opts = opts;
};

module.exports = ControllerLoader;

/**
 * This shall load all controllers available under defined controller directory (opts.controllerDirs).
 *
 * The result shall be the object contain all loaded controller, the object key is the controller name (i.e. authcontroller)
 *
 * @param opts
 * @param opts.rootAppPath      {String} The root application path for finding of resources.
 * @param opts.controllerDirs
 * @param opts.logger
 *
 * @return {Promise.<{Object}>}
 */
ControllerLoader.prototype.load = async (opts) => {
  opts = opts || this.opts || {};
  const rootAppPath = opts.rootAppPath || process.env["ROOT_APP_PATH"];
  const log = opts.logger || console;
  /* i.e. user: user controller instance */
  const controllers = {};
  const controllerFiles = [];
  let userProvidedControllerDirs = opts.controllerDirs || ['api/controllers/**/*.js'];
  userProvidedControllerDirs = (Array.isArray(userProvidedControllerDirs) ? userProvidedControllerDirs : [userProvidedControllerDirs]);

  for (let i = 0; i < userProvidedControllerDirs.length; i++) {
    let tempDir = userProvidedControllerDirs[i];
    let fullDir;

    if (path.isAbsolute(tempDir)) {
      fullDir = tempDir;
    } else {
      fullDir = path.join(rootAppPath, tempDir);
    }

    log.debug(`${COMPONENT_NAME} Loading controllers in: ${fullDir}`);

    const foundFiles = glob.sync(fullDir, {nodir: true});

    for (let c = 0; c < foundFiles.length; c++) {
      const file = foundFiles[c];
      const fileInfo = path.parse(file);
      // console.log(fileInfo);
      const controllerId = fileInfo.name.toLowerCase().replace('controller', '');
      try {
        controllers[controllerId] = require(file);
        controllerFiles.push(file);
      } catch (ex) {
        log.error(`Error when loading controllers!`, ex);
        throw ex;
      }
    }
  }

  return {controllers, controllerFiles};
};

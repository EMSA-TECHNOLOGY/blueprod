/*#*
***************************************************************************************************
** Copyright © 2016 EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** This software is the proprietary information of EMSA TECHNOLOGY COMPANY LTD and ÉOLANE. Unauthorized
** copying of this file, via any medium is strictly prohibited proprietary and confidential.
**
** File:         WebServiceApplication.js
** Version:      0.1
** Created:      2018/06/29 09:00:00 (GMT+7)
** Author:       <href="mailto:thanhlq@emsa-technology.com"> Thanh LE</a>
**
** Description:
***************
** Server-side Web Service library.
**
** History:
***********
** Version 0.1  2018/06/29 09:00:00  thanhlq
**   + Creation and implementation.
***************************************************************************************************
*#*/

'use strict';

const DEFAULT_VIEW_FOLDER_NAME = 'views';
const _ = require('lodash');

/**
 * Contain the engine and corresponding package
 */
const SUPPORTED_ENGINES = {
  'ejs': {
    extension: '.ejs',
    engine: 'ejs'
  },
};

module.exports = function ResolveViews(wsApp, /* opts */) {
  const config = wsApp.ws.config;
  const constants = wsApp.ws.constants;
  const logger = wsApp.logger || console;

  if (config.get(constants.VIEW_ENABLED_CK, true) === false) {
    /* Ignore */
  } else {
    const views = require('koa-views');
    const path = require('path');
    const app = wsApp.app;
    const viewDirectory = config.get(constants.VIEW.VIEW_DIRECTORY_CK, DEFAULT_VIEW_FOLDER_NAME);
    const rootAppPath = config.getRootAppPath();
    let enabledViewEngines = config.get(constants.VIEW.VIEW_ENGINES_ENABLED, ['ejs']);
    enabledViewEngines = Array.isArray(enabledViewEngines) ? enabledViewEngines : [enabledViewEngines];
    const viewMap = {};
    const extDefault = config.get(constants.VIEW.EXTENSION_DEFAULT_CK, 'ejs');

    enabledViewEngines.forEach((userDefinedEngine) => {
      let userEngineName;
      let ext;

      if (_.isObject(userDefinedEngine)) {
        userEngineName = userDefinedEngine.engine;
        ext = userDefinedEngine.extension;
      } else {
        userEngineName = userDefinedEngine;
      }

      if (!userEngineName || !SUPPORTED_ENGINES[userEngineName]) {
        throw new Error('Invalid view engine configuration! engine is not supported: ' +userDefinedEngine);
      }

      if (!ext) {
        ext = SUPPORTED_ENGINES[userEngineName].extension;
      }

      viewMap[ext] = SUPPORTED_ENGINES[userEngineName].engine;
    });

    if (!_.isEmpty(viewMap)) {
      /*
      views(root, opts)
        root: Where your views are located. Must be an absolute path. All rendered views are relative to this path
        opts (optional)
        opts.extension: Default extension for your views
       */
      app.use(
        views(
          path.join(rootAppPath, viewDirectory),
          {
            map: viewMap,
            extension: extDefault
          }));
    } else {
      logger.debug('View feature is enabled but no view engined defined!');
    }
  }
};

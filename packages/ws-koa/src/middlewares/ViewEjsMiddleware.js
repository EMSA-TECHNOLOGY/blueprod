'use strict';

const utils = require('@blueprod/common').Utils;

/**
 * This middleware is to support only EJS view.
 *
 * @param wsApp
 */
module.exports = function ResolveViews(wsApp, /* opts */) {
  const config = wsApp.config;
  const constants = wsApp.constants;
  const viewDirName = process.env[wsApp.constants.CONFIG_KEYS.VIEW_DIR_NAME] || 'view';
  const ejsExtDefault = process.env[wsApp.constants.CONFIG_KEYS.EJS_EXTENSION_DEFAULT] || 'ejs';
  const viewDebug = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.VIEW_DEBUG_ENABLED]);
  const viewCacheEnabled = utils.parseBoolean(process.env[wsApp.constants.CONFIG_KEYS.VIEW_CACHE_ENABLED]);

  if (config.get(constants.VIEW.VIEW_ENABLED_CK, true) === false) {
    /* Ignore */
  } else {
    const render = require('@blueprod/ws-view-koa-ejs');
    const path = require('path');
    let app = wsApp.app;

    /* This method will add render to context -> we will use ctx.render(viewName, {layout : layoutName, otherConfig : "vaa"}) */
    /* This will put layout into view in 'body' */
    render(app, {
      root: path.join(config.rootAppPath, viewDirName),
      layout: false, /* Default layout set to false return only view without layout */
      viewExt: ejsExtDefault,
      cache: viewCacheEnabled,
      debug: viewDebug,
    });
  }
};

/*!
 * koa-ejs - index.js
 * Copyright(c) 2017 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

const debug = require('debug')('ws-view-koa-ejs');
const fs = require('mz').fs;
const path = require('path');
const ejs = require('ejs');

/**
 * Temp assigned for override later
 */
const parentResolveInclude = ejs.resolveInclude;

/**
 * default render options
 * @type {Object}
 */
const defaultSettings = {
  cache: true,
  layout: 'layout',
  viewExt: 'html',
  locals: {},
  compileDebug: false,
  debug: false,
  writeResp: true
};

/**
 * set app.context.render(view, data, opts).
 *
 * usage:
 * ```
 * await ctx.render('user', {name: 'dead_horse'}, {layout: 'template.ejs'});
 * ```
 * @param app koa application instance
 * @param settings user settings
 * @param settings.root
 */
exports = module.exports = function (app, settings) {
  if (app.context.render) {
    return;
  }

  if (!settings || !settings.root) {
    throw new Error('settings.root required');
  }

  settings.root = path.resolve(process.cwd(), settings.root);

  /**
   * cache the generate package
   * @type {Object}
   */
  const cache = Object.create(null);

  settings = Object.assign({}, defaultSettings, settings);

  settings.viewExt = settings.viewExt
    ? '.' + settings.viewExt.replace(/^\./, '')
    : '';

  /**
   * generate html with view name and options
   * @param {String} view
   * @param {Object} options
   * @return {String} html
   */
  async function render(view, options) {
    view += settings.viewExt;
    const viewPath = path.join(settings.root, view);
    debug(`render: ${viewPath}`);
    // get from cache
    if (settings.cache && cache[viewPath]) {
      return cache[viewPath].call(options.scope, options);
    }

    const tpl = await fs.readFile(viewPath, 'utf8');

    // override `ejs` node_module `resolveInclude` function
    ejs.resolveInclude = function (name, filename, isDir) {
      if (!path.extname(name)) {
        name += settings.viewExt;
      }
      return parentResolveInclude(name, filename, isDir);
    };

    const fn = ejs.compile(tpl, {
      filename: viewPath,
      _with: settings._with,
      compileDebug: settings.debug && settings.compileDebug,
      debug: settings.debug,
      delimiter: settings.delimiter
    });
    if (settings.cache) {
      cache[viewPath] = fn;
    }

    return fn.call(options.scope, options);
  }

  /**
   * The implementation for the ctx.render, support layout in both context and options.
   * @param view
   * @param _context
   * @param _context.layout
   * @param opts
   * @param opts.layout
   * @return {Promise.<*>}
   */
  app.context.render = async function (view, _context, opts = {}) {
    const ctx = this;

    const context = Object.assign({}, ctx.state, _context);

    let html = await render(view, context);

    const layout = context.layout === false ? false : (opts.layout || context.layout || settings.layout);
    if (layout) {
      // if using layout
      context.body = html;
      html = await render(layout, context);
    }

    const writeResp = context.writeResp === false ? false : (context.writeResp || settings.writeResp);
    if (writeResp) {
      // normal operation
      ctx.type = 'html';
      ctx.body = html;
    } else {
      // only return the html
      return html;
    }
  };
};

/**
 * Expose ejs
 */

exports.ejs = ejs;

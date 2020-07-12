'use strict';

const delegate = console;
const cachedLoggers = {};

function isDebug(name) {
  name = name ? name.name || name : 'root';
  const key = name + '_DEBUG';
  /* Explicitly disabled */
  if (process.env[key] === 'FALSE') {
    return false;
  } else {
    return (process.env[name + '_DEBUG'] === 'TRUE' || process.env['DEBUG_ALL'] === 'TRUE');
  }
}

class Logger {

  constructor(ns, opts) {
    this.namespace = ns;
    this.opts = opts || {};
    this.isDebugMode = this.opts.debug !== undefined ? this.opts.debug : this.isDebug();
  }

  /**
   * @param [name]
   * @return {boolean}
   */
  isDebug(name) {
    return isDebug(name || this.namespace);
  }

  debug(message, e) {
    if (this.isDebugMode) {
      delegate.debug(message);
      if (e) {
        delegate.debug(e);
      }
    }
  }

  info(message, data) {
    delegate.info(message);
    if (data) {
      delegate.info(data);
    }
  }

  warn(message, ex) {
    delegate.warn(message);
    if (ex) {
      delegate.warn(ex);
    }
  }

  error(message, ex) {
    delegate.error(message);
    if (ex) {
      delegate.error(ex);
    }
  }

}

class NamespacedLogger {

  constructor(ns, opts) {
    this.namespace = ns || 'root';
    this.opts = opts || {};
  }

  /**
   * @param [name]
   * @return {boolean}
   */
  isDebug(name) {
    return isDebug(name || this.namespace);
  }

  debug(message, e) {
    delegate.debug(`[${this.namespace}] ${message}`);
    if (e) {
      delegate.debug(e);
    }
  }

  trace(message, e) {
    delegate.debug(`[${this.namespace}] [TRACE] ${message}`);
    if (e) {
      delegate.debug(e);
    }
  }

  info(message, data) {
    delegate.info(`[${this.namespace}] ${message}`);
    if (data) {
      delegate.info(data);
    }
  }

  warn(message, ex) {
    delegate.warn(`[${this.namespace}] ${message}`);
    if (ex) {
      delegate.warn(ex);
    }
  }

  error(message, ex) {
    delegate.error(`[${this.namespace}] ${message}`);
    if (ex) {
      delegate.error(ex);
    }
  }

}

module.exports = function (namespace = '', opts) {
  let logger = cachedLoggers[namespace];
  if (logger) {
    return logger;
  }
  return process.env['BD_LOGGER_NAMESPACE'] === 'TRUE' ?
    cachedLoggers[namespace] = new NamespacedLogger(namespace, opts) :
    cachedLoggers[namespace] = new Logger(namespace, opts)
}

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

const jsonPretty = process.env['BD_LOG_JSON_PRETTY'] === 'TRUE';

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

  json(e) {
    return (typeof e === 'object' ?
      jsonPretty ? JSON.stringify(e, null, 2) : JSON.stringify(e)
      : e);
  }

  debug(message, e) {
    if (this.isDebugMode) {
      delegate.debug(message);
      if (e) {
        delegate.debug(this.json(e));
      }
    }
  }

  log(message, data) {
    this.info(message, data);
  }

  info(message, data) {
    delegate.info(message);
    if (data) {
      delegate.info(this.json(data));
    }
  }

  warn(message, e) {
    delegate.warn(message);
    if (e) {
      delegate.warn(this.json(e));
    }
  }

  error(message, e) {
    delegate.error(message);
    if (e) {
      delegate.error(this.json(e));
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

  json(e) {
    return (typeof e === 'object' ?
      jsonPretty ? JSON.stringify(e, null, 2) : JSON.stringify(e)
      : e);
  }

  debug(message, e) {
    delegate.debug(`[${this.namespace}] ${message}`);
    if (e) {
      delegate.debug(this.json(e));
    }
  }

  trace(message, e) {
    delegate.debug(`[${this.namespace}] [TRACE] ${message}`);
    if (e) {
      delegate.debug(this.json(e));
    }
  }

  log(message, data) {
    return this.info(message, data);
  }

  info(message, data) {
    delegate.info(`[${this.namespace}] ${message}`);
    if (data) {
      delegate.info(this.json(data));
    }
  }

  warn(message, e) {
    delegate.warn(`[${this.namespace}] ${message}`);
    if (e) {
      delegate.warn(this.json(e));
    }
  }

  error(message, e) {
    delegate.error(`[${this.namespace}] ${message}`);
    if (e) {
      delegate.error(this.json(e));
    }
  }

}

module.exports = function (namespace = '', opts) {
  let logger = cachedLoggers[namespace];
  if (logger) {
    return logger;
  }
  /**
   * The option to also print the namespace (logger name) in the log message.
   */
  return process.env['BD_LOG_PRINT_NAMESPACE'] === 'TRUE' ?
    cachedLoggers[namespace] = new NamespacedLogger(namespace, opts) :
    cachedLoggers[namespace] = new Logger(namespace, opts)
}

/*#*
***************************************************************************************************
** Copyright © 2018 EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** License:       MIT
**
** File:          Logger.js
** Version:       0.1
** Author:        <href="mailto:thanhlq@emsa-technology.com"> Thanh LE</a>
**
** Description:
***************
** The main logger for the entire system. By using the underline Winston logger.
**
** History:
***********
** Version 0.1  2018/05/08 09:00:00 (GMT+7)  thanhlq
**   + Creation and implementation.
***************************************************************************************************
*#*/

/** @module Logger */

'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const _ = require('lodash');
const path = require('path');
const winston = require('winston');
const fs = require('fs');
const mkdirp = require('mkdirp');
const moment = require('moment');
const debug = require('debug');
const { format } = require('logform');
const { combine, label, timestamp, printf } = format;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const constants = {
  BLUEPROD_PLATFORM_NAME:     'blueprod',
  BLUEPROD_LOG_DIR_CK:        'BLUEPROD_LOG_DIR',

  DEFAULT_MONGODB_CONN_URL:   'mongodb://localhost:27017/blueprod_log',

  DEFAULT_CONFIG: Object.freeze({
    "console": {
      "enabled": true,
      "level": "debug"
    },
    "file": {
      "enabled": true,
      "level": "debug",
      "logAppend": true,
      /* 5MB */
      "maxsize": 5242880,
      "json": true,
      "prettyPrint": true,
      "depth": 10,
      "tailable": true,
      "zippedArchive": true,
      "datePattern": "yyyy-MM-dd"
    },
    "database": {
      /* @see: https://github.com/winstonjs/winston-mongodb */
      "enabled": false,
      /* Will remove color attributes from the log entry message, defaults to false. */
      "decolorize": true,
      "leaveConnectionOpen": false,
      /* collection: The name of the collection you want to store log messages in, defaults to 'log'. */
    },
  }),
};
/** Initialized logger by namespace/component */
const initializedLoggers = {};
/**
 * First received the configuration option and then to be used for later logger if not provided.
 */
let configurationOptions;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 * The main logger for the entire system. By using the underline Winston logger.
 *
 * Create a new Logger Object instance with input parameter Example : {name : "IoTService"}
 * Set all variable to function scope (this or self = this) to avoid global variable being updated when more than one instantiation
 * @constructor
 */
const Logger = function (namespace, opts) {
  namespace = namespace || 'RootLogger';
  const nsInstance = initializedLoggers[namespace];

  if (nsInstance) {
    return nsInstance;
  } else {
    this.hooks = null;
    /* Store all log transport */
    this.logTransport = {};
    /* Store distinctive log transport */
    this.logConnector = null;
    namespace = namespace.name || namespace;
    this.namespace = namespace;
    this.internal_initLogger(this.namespace, opts);
    // this.addLogMonitoring(this.logger);
    this.isDebug = debug.enabled(this.namespace);
    initializedLoggers[namespace] = this;
  }
};

Logger.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = function (namespace) {
  return new Logger(namespace);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

Logger.prototype.isDebug = function () {
  return debug.enabled(this.namespace);
};

/**
 *
 * @param opts        {Object}
 */
Logger.prototype.parseConfigurations = function (opts = {}) {
  this.options = {};
  _.extend(this.options, constants.DEFAULT_CONFIG);

  this.options.console.enabled = (opts.console && opts.console.enabled);
  this.options.file.enabled = (opts.file && opts.file.enabled);
  this.options.database.enabled = (opts.database && opts.database.enabled);

  /* my lazy, later - to parse/validate */
  _.merge(this.options.console, opts.console || {});
  _.merge(this.options.file, opts.file || {});
  _.merge(this.options.database, opts.database || {});

  if (!configurationOptions) {
    configurationOptions = this.options;
  }

  return this.options;
};

/**
 * This method should be invoked to configure the logger (then shall be reused for later logger).
 *
 * @param opts  {Object},
 */
Logger.prototype.configure = function (opts) {
  if (opts && !_.isEmpty(opts)) {
    return this.parseConfigurations(opts);
  } else if (this.options && !_.isEmpty(this.options)) {
    return this.parseConfigurations(this.options);
  } else {
    return this.parseConfigurations(constants.DEFAULT_CONFIG);
  }
};

/**
 * Detect the log directory.
 *
 * @param opts
 */
Logger.prototype.internal_detectLogDirectory = function(opts = {}) {
  if (!this.logDir) {
    this.logDir = opts.logDir || process.env[constants.BLUEPROD_LOG_DIR_CK];

    if (!this.logDir) {
      let rootAppPath = opts.rootAppPath || global.rootAppPath || process.env["BLUEPROD_ROOT_APP_PATH"] || require('app-root-path').path;
      this.logDir = path.join(rootAppPath, "logs");
    }
  }
  return this.logDir;
};

/**
 * Init winston logger
 *
 * @param componentName
 * @param options {Object} user provided options.
 */
Logger.prototype.internal_initLogger = function (componentName, options) {
  const self = this;
  let winstonTransports = [];
  const logging = this.configure(options);

  if (logging.console.enabled) {
    const alignedWithColorsAndTime = format.combine(
      format.colorize(),
      // label({ label: self.namespace }),
      format.timestamp(),
      format.align(),
      format.printf(info => `${info.timestamp}  ${info.level}: ${info.message}`)
    );

    let consoleTransport = new winston.transports.Console({
      level: logging.console.level || 'debug',
      // handleExceptions: true,
      // json: false,
      // colorize: true
      format: alignedWithColorsAndTime
    });
    winstonTransports.push(consoleTransport);
  }

  if (logging.database.enabled) {
    try {
      /**
       * Requiring `winston-mongodb` will expose `winston.transports.MongoDB`
       */
      require('winston-mongodb').MongoDB; //winston.add(winston.transports.MongoDB, options);

      const dbTransport = new winston.transports.MongoDB({
        level: logging.database.level || 'info',
        db: logging.database.url || constants.DEFAULT_MONGODB_CONN_URL,
        /* If this name is changed -> should update the corresponding Platform Log model name */
        collection: logging.database.collection || 'log',
        storeHost: true,
        label: {componentName: self.namespace},
        tryReconnect: logging.database.tryReconnect === undefined ? true : logging.database.tryReconnect,
      });

      winstonTransports.push(dbTransport);
    } catch (eDB) {
      console.error('Error when configuring the database logging transport: ', eDB);
    }
  }

  if (logging.file.enabled) {
    let logFilename = logging.file.fileName || constants.BLUEPROD_PLATFORM_NAME +'.log';
    const filePath = self.internal_getOrCreateLogFilePath(self.internal_detectLogDirectory(options), logFilename);
    // const alignedAndTime = format.combine(
    //   format.timestamp(),
    //   format.align(),
    //   format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    // );
    /* If file existed -> create file log transport */
    /* TODO: To add the json options */
    /* @see https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport */
    let fileTransport = new winston.transports.File({
      // format: alignedAndTime,
      level: (logging.file.level || 'info'),
      filename: filePath,
      /* bug: Doesn't log anything to file transport when handleExceptions is true and exitOnError is true #1368 */
      /* https://github.com/winstonjs/winston/issues/1368 */
      handleExceptions: false,
      json: (logging.file.json || false),
      zippedArchive: false,
      /* in bytes */
      maxsize: 5 * 1000 * 1000, // 1MB
      maxFiles: 50,
      tailable: true,
      colorize: false,
      depth: 10,
    });
    winstonTransports.push(fileTransport);
  }

  if (_.size(winstonTransports)) {
    self.logger = winston.createLogger({
      transports: winstonTransports,
      exitOnError: false
    });
    self.logger.info(`Logger for [${self.namespace}] instantiated with transports: [console: ${logging.console.enabled}, file: ${logging.file.enabled}, database: ${logging.database.enabled}]`);
  } else {
    console.error('[NOK] No logging transport configured!');
    self.logger = {
      debug: function (m) {
        /* do nothing */
      },
      info: function (m) {
        /* do nothing */
      },
      warn: function (m) {
        /* do nothing */
      },
      error: function (m) {
        /* do nothing */
      }
    };
  }
};

/**
 * Add hook monitoring when a log is executed in console, file or database.
 * @param logger
 */
Logger.prototype.addLogMonitoring = function (logger) {
  const self = this;

  self.internal_getDistinctiveTransport();

  logger.on('logging', function (transport, level, msg, meta) {
    if (self.hooks && !_.isEmpty(self.hooks) && transport && transport.name === self.logConnector) {
      const activeHooks = self.hooks.get(level);

      if (activeHooks && _.isArray(activeHooks) && activeHooks.length > 0) {
        for (let hook of activeHooks) {
          const logObject = {
            connector: transport.name,
            level: level,
            message: msg,
            meta: meta
          };
          hook(logObject);
        }
      } else {
        /* Ignore */
      }
    } else {
      /* Ignore */
    }
  });
};

/**
 * Create get get file log path
 * Note: The log file directory is only accepted user path (ex: home/username/*) with system path(ex: /var/lib/*, etc) it will raise PERMISSION error
 *
 * Log directory will have a structure like below
 * Year (Ex: 2018, 2019)
 *  |
 *  ---- Month (Ex : January, May, etc)
 *         |
 *         ---- Day (01, 02, etc)
 *                  |
 *                  ------ js8.log
 *                  ------ js8_2.log
 *
 * @param parentDir   {String} Ex: <project_directory>/logs/
 * @param fileName     {String} Ex: js8.log
 * @return {*}
 */
Logger.prototype.internal_getOrCreateLogFilePath = function (parentDir, fileName) {
  let filePath;
  let currentDate;
  let currentYearName;
  let currentMonthName;
  let currentDayName;
  let yearPath, monthPath, dayPath;

  /* Check year folder name */
  currentDate = new Date();
  currentYearName = moment(currentDate).startOf("year").format('YYYY');
  yearPath = path.join(parentDir, currentYearName);

  /* Create year path if not existed */
  if (!fs.existsSync(yearPath)) {
    mkdirp.sync(yearPath);
  } else {
    /* Ignore */
  }

  currentMonthName = moment(currentDate).startOf("month").format('MMMM');
  monthPath = path.join(yearPath, currentMonthName);

  /* Create month path if not existed */
  if (!fs.existsSync(monthPath)) {
    mkdirp.sync(monthPath);
  } else {
    /* Ignore */
  }

  currentDayName = moment(currentDate).startOf("date").format('DD');
  dayPath = path.join(monthPath, currentDayName);

  /* Create month path if not existed */
  if (!fs.existsSync(dayPath)) {
    mkdirp.sync(dayPath);
  } else {
    /* Ignore */
  }

  /* This is final log file path */
  filePath = path.join(dayPath, fileName);

  return filePath;
};

/**
 * Add hook to notify when logger is executed logging action to console, file, or database.
 * This hook will be executed whenever there was a log activity and match the condition (level)
 *
 * @param hook       {Object}
 * @param hook.level {String} use to indicate when hook is  called when match level.
 * @param hook.cb    {Function} a callback will be executed when logger level is matched hook.level
 */
Logger.prototype.addHook = function (hook) {
  const self = this;
  if (!self.hooks) {
    self.hooks = new Map();
  } else {
    /* Ignore */
  }

  if (hook && _.isObject(hook) && hook.level && hook.cb) {
    let hookValue = self.hooks.get(hook.level);

    if (hookValue) {
      self.hooks.set(hook.level, hookValue.push(hook.cb));
    } else {
      self.hooks.set(hook.level, [hook.cb]);
    }
  } else {
    /* Ignore */
  }
};

/**
 * Print out error message
 * @param message
 * @param err
 */
Logger.prototype.error = function (message, err) {
  this.logger.error(this.buildMessageContent(message), err);
};

/**
 * Print out warning message
 * @param message
 * @param err
 */
Logger.prototype.warn = function (message, err) {
  this.logger.warn(this.buildMessageContent(message), err);
};

/**
 * Print out info message
 * @param message
 * @param err
 */
Logger.prototype.info = function (message, err) {
  this.logger.info(this.buildMessageContent(message), err);
};

/**
 * Print out verbose message
 * @param message
 * @param err
 */
Logger.prototype.verbose = function (message, err) {
  this.logger.verbose(this.buildMessageContent(message), err);
};

/**
 * Print out debug message
 * @param message
 * @param err
 */
Logger.prototype.debug = function (message, err) {
  this.logger.debug(this.buildMessageContent(message), err);
};

/**
 * Print out debug/info message
 * @param message
 * @param err
 */
Logger.prototype.log = function (message, err) {
  this.logger.info(this.buildMessageContent(message), err);
};

/**
 * Build message content
 * Component name - message
 * @param message
 * @return {string}
 */
Logger.prototype.buildMessageContent = function (message) {
  return `[${this.namespace}] ${message}`;
};

/**
 * Get only one transport enable at a time (either console or file or mongodb but not all of them)
 * Note: This is a workaround to make this capture the log event one time, this prevent duplicated event
 * Consider to remove this one if we want to capture all those log activities of each transport
 *
 * because log monitoring will capture all transport types when each log is executed
 * so it will execute a callback of transport.length times with each enable = true
 */
Logger.prototype.internal_getDistinctiveTransport = function () {
  const self = this;
  if (self.logTransport && _.isObject(self.logTransport)) {
    if (self.logTransport.console) {
      self.logConnector = "console";
    } else if (self.logTransport.database) {
      self.logConnector = "mongodb";
    } else {
      self.logConnector = "file";
    }
  } else {
    /* Ignore */
  }
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

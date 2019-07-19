/*#*
***************************************************************************************************
** EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** File:          BlueProdConfig.js
** Version:       0.1
** License:       MIT
**
** Description:
***************
**
** History:
***********
** Version 0.1  thanhlq
**   + Creation and implementation.
***************************************************************************************************
*#*/

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const dotenv = require('dotenv');
const glob = require('glob');

const ENV_TEST_PATTERN = '**/!(development.js|development.yaml|development.yml|development.json|production.js|production.yaml|production.json)';
const ENV_DEVELOPMENT_PATTERN = '**/!(test.js|test.yaml|test.json|production.js|production.yaml|production.yml|production.json)';
const ENV_PRODUCTION_PATTERN = '**/!(development.js|development.yaml|development.json|test.js|test.yaml|test.yml|test.json)';

// const SUPPORTED_CONFIG_FILE_FORMATS = {
//   '.json':     true,
//   '.yaml':     true,
//   '.yml':     true,
//   '.js':       true,
// };

/**
 *
 * @constructor
 */
const BlueProdConfig = function() {
};

const config = new BlueProdConfig();

module.exports = config;

/**
 * Start to loading configurations. This function must be called before used.
 *
 * @sync
 *
 * @param opts
 * @param opts.debug {*} Debug this module.
 * @param opts.rootAppPath
 * @param opts.rootConfigPath
 * @param opts.configDirName (combined with root application path)
 */
BlueProdConfig.prototype.load = function (opts = {}) {
  if (this.loaded) {
    return this;
  }

  const self = this;
  self.debug = opts.debug;
  let nodeEnv = process.env["NODE_ENV"];
  self.properties = {};

  if (!nodeEnv || nodeEnv === '') {
    console.error(chalk.bgRed('Node environment [NODE_ENV] is not specified!'));
  }

  // path.resolve(__dirname).split('/node_modules')[0]
  self.rootAppPath = opts.rootAppPath || global.rootAppPath || process.env['BLUEPROD_ROOT_APP_PATH'] || require('app-root-path').path;
  self.rootConfigPath = opts.rootConfigPath || process.env['BLUEPROD_ROOT_CONFIG_PATH'] || (path.join(self.rootAppPath, opts.configDirName || process.env['BLUEPROD_CONFIG_DIR_NAME'] || 'config'));
  process.env['BLUEPROD_ROOT_APP_PATH'] = global.rootAppPath =  self.rootAppPath;
  process.env['BLUEPROD_ROOT_CONFIG_PATH'] = global.rootConfigPath =  self.rootConfigPath;

  console.log(chalk.bgGreen(`┌──────────────────────────────────────────────────────────────────────────────┐`));
  console.log(chalk.bgGreen(`| NODE_ENV:            ${nodeEnv}`.padEnd(79, ' ') +'|'));
  console.log(chalk.bgGreen(`| ROOT APP PATH:       ${self.rootAppPath}`.padEnd(79, ' ') +'|'));
  console.log(chalk.bgGreen(`| ROOT CONFIG PATH:    ${self.rootConfigPath}`.padEnd(79, ' ') +'|'));
  console.log(chalk.bgGreen(`└──────────────────────────────────────────────────────────────────────────────┘`));

  /* bug: https://stackoverflow.com/questions/26973484/node-dotenv-is-not-working/43522068#43522068 */
  //{path: __dirname + '/.env'}
  dotenv.config({path: path.join(self.rootAppPath, '.env'), debug: opts.debug | false});

  /* load further env file if existed: .env.production */
  if (nodeEnv && nodeEnv !== '') {
    let envFile = path.join(self.rootAppPath, `.env.${nodeEnv}`);
    if (fs.existsSync(envFile)) {
      const envConfig = dotenv.parse(fs.readFileSync(envFile));
      for (let k in envConfig) {
        process.env[k] = envConfig[k]
      }
    }
  }

  self.nodeEnv = nodeEnv;
  /* Keep a frozen copy of node env vars */
  self.env = process.env;

  if (fs.existsSync(self.rootConfigPath)) {
    self.loadConfigInPath(self.rootConfigPath);
    if (self.debug) {
      self.log(self.properties);
    }
  } else {
    console.log(`Configuration folder does not exist: ` +self.rootConfigPath);
  }

  self.properties = _.merge(self.properties || {}, self.env);
  self.loaded = true;
  return self;
};

/**
 * Used for testing or cases as your runtime application configuration changes.
 *
 * @param opts
 * @returns {BlueProdConfig|*}
 */
BlueProdConfig.prototype.reload = function (opts = {}) {
  this.loaded = false;
  return this.load(opts);
};

BlueProdConfig.prototype.log = function(obj) {
  console.log(JSON.stringify(obj, null, 2));
};

BlueProdConfig.prototype.getNodeEnv = function (opts = {}) {
  return this.nodeEnv;
};

/**
 * To load all the configuration under root_app/config/*.json *.yaml
 *
 * @sync
 * @param configPath {String} the full or relative path (to the root app path) configuration directory
 */
BlueProdConfig.prototype.loadConfigInPath = function (configPath) {
  const self = this;
  let nodeEnv = this.getNodeEnv();
  let pattern;

  if (nodeEnv === 'test') {
    pattern = ENV_TEST_PATTERN;
  } else if (nodeEnv === 'development') {
    pattern = ENV_DEVELOPMENT_PATTERN;
  } else if (nodeEnv === 'production') {
    pattern = ENV_PRODUCTION_PATTERN;
  } else {
    console.log(`[WARN] The node env (NODE_ENV) is not set, you should explicitly set this as one of: test | development | production`);
  }

  if (pattern) {
    if (!path.isAbsolute(configPath)) {
      configPath = path.join(this.rootAppPath, configPath);
    }

    if (fs.existsSync(configPath)) {
      const files = glob.sync(path.join(configPath, pattern), {nodir: true});
      let filesLen = files.length;
      for (let i = 0; i < filesLen; i++) {
        let f = files[i];
        self.loadConfigFile(f);
      }
    } else {
      console.error(`The configuration does not exist: ` +configPath);
    }
  }

  return self;
};

/**
 * Load configurations in a specific file.
 * a
 * @sync
 * @param filePath
 * @param encoding
 * @return {*}
 */
BlueProdConfig.prototype.loadConfigFile = function (filePath, encoding = 'utf8') {
  let fileExt = path.extname(filePath);
  let configs;

  if (this.debug) {
    console.log(`Loading config file: ${filePath}`);
  }

  try {
    if (fileExt === '.json' || fileExt === '.js') {
      configs = require(filePath);
    } else if (fileExt === '.yml' || fileExt === '.yaml') {
      const yaml = require('js-yaml');
      configs = yaml.safeLoad(fs.readFileSync(filePath, encoding));
    } else {
      console.log(`[NOK] Ignored unsupported file format: ${filePath}`);
    }
  } catch (e) {
    console.error(`Failed to load configuration file: ${filePath}`);
    console.log(e);
  }

  if (configs && !_.isEmpty(configs)) {
    this.properties = _.merge(this.properties || {}, configs);
  }

  return configs;
};

BlueProdConfig.prototype.printEnv = function (std = console.log) {
  std(process.env);
};

BlueProdConfig.prototype.get = function (key) {
  return getImpl(this.properties, key);
};

BlueProdConfig.prototype.set = function (key, value) {
  this.properties[key] = value;
  return this;
};

/**
 * Underlying get mechanism (https://github.com/lorenwest/node-config/blob/master/lib/config.js)
 *
 * @private
 * @method getImpl
 * @param object {object} - Object to get the property for
 * @param property {string|string[]} - The property name to get (as an array or '.' delimited string)
 * @return value {*} - Property value, including undefined if not defined.
 */
const getImpl= function(object, property) {
  var t = this,
    elems = Array.isArray(property) ? property : property.split('.'),
    name = elems[0],
    value = object[name];
  if (elems.length <= 1) {
    return value;
  }
  // Note that typeof null === 'object'
  if (value === null || typeof value !== 'object') {
    return undefined;
  }
  return getImpl(value, elems.slice(1));
};

// process.cwd() returns the current working directory,
// i.e. the directory from which you invoked the node command.
// console.log(process.cwd());
//__dirname returns the directory name of the directory containing the JavaScript source code file

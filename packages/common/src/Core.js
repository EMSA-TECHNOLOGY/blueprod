/** @module Core */

'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const _ = require('lodash');
const events = require('events');
const fs = require('fs');
const path = require('path');

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘
const constants = {};
const eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(1000);

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

const Core = function () {
  if (process.env.NODE_ENV) {
    this.env = process.env.NODE_ENV;
  } else {
    this.env = 'production';
  }

  this.Promise = Promise;
};

Core.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = new Core();

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 * Listen an event.
 *
 * @param eventName
 * @param cb
 */
Core.prototype.on = function (eventName, cb) {
  eventEmitter.on(eventName, cb);
};

/**
 * Emit an event.
 *
 * @param eventName
 * @param eventData
 */
Core.prototype.emit = function (eventName, ...eventData) {
  eventEmitter.emit(eventName, ...eventData);
};

/**
 * Unregister an event.
 *
 * @param eventName
 * @param cb
 */
Core.prototype.removeListener = function (eventName, cb) {
  eventEmitter.removeListener(eventName, cb);
};

/**
 * Convert object to json.
 *
 * @param obj
 */
Core.prototype.json = function (obj) {
  return JSON.stringify(obj);
};

Core.prototype.jsonPretty = function (obj, indents = 2) {
  return JSON.stringify(obj, null, indents);
};

/**
 * Return a deeply cloned object.
 *
 * @param obj
 */
Core.prototype.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

Core.prototype.isDevelopment = () => {
  return (this.env === 'development');
};

Core.prototype.isProduction = () => {
  return (this.env === 'production');
};

Core.prototype.isTest = () => {
  return (this.env === 'test');
};

Core.prototype.toArray = (ele) => {
  return (ele ? (Array.isArray(ele) ? ele : [ele]) : []);
};

/**
 * File files in a directory - recursively is supported.
 *
 * @param dir
 * @param opts
 * @param opts.recursive {Boolean}      Default false
 * @param opts.extension  {[String]}    Default empty
 * @param done
 */
Core.prototype.findFiles = (dir, opts = {}, done) => {
  const self = this;

  if (opts && typeof opts === 'function') {
    done = opts;
    opts = {};
  }

  let extensions = opts.extension || [];

  extensions = (Array.isArray(extensions) ? extensions : [extensions]);

  let results = [];
  fs.readdir(dir, function (err, list) {
    if (err)
      return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file)
        return done(null, results);
      file = path.join(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          if (opts.recursive) {
            self.findFiles(file, opts, function (err, res) {
              results = results.concat(res);
              next();
            });
          }
        } else {
          if (extensions.length < 1) {
            results.push(file);
          } else {
            let basename = path.basename(file);
            for (let i = 0; i < extensions.length; i++) {
              if (basename.endsWith(extensions[i])) {
                results.push(file);
                break;
              }
            }
          }
          next();
        }
      });
    })();
  });
};

Core.prototype.findFilesSync = (dir, opts = {}) => {
  const self = this;
  let extensions = opts.extension || [];

  extensions = (Array.isArray(extensions) ? extensions : [extensions]);

  let results = [];
  const list = fs.readdirSync(dir);

  if (!list || list.length === 0) {
    return results;
  }

  let i = 0;
  (function next() {
    let file = list[i++];
    if (!file) {
      return results;
    }

    file = path.join(dir, file);
    const stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      if (opts.recursive) {
        const res = self.findFilesSync(file, opts);
        results = results.concat(res);
        next();
      }
    } else {
      if (extensions.length < 1) {
        results.push(file);
      } else {
        let basename = path.basename(file);
        for (let i = 0; i < extensions.length; i++) {
          if (basename.endsWith(extensions[i])) {
            results.push(file);
            break;
          }
        }
      }
      next();
    }
  })();
};

/*function UnitTest() {
  console.log(module.exports.toArray('a'));
  console.log(module.exports.toArray(undefined));
  console.log(module.exports.toArray(['a']));

  const obj1 = {
    a: 'value a',
    b: {
      b1: 1,
      b2: 'b2 string value',
      c: {
        c1: true,
        c2: 'c2 string value'
      }
    },
    aa: 'aa value'
  };

  console.log(module.exports.jsonPretty(obj1));
}*/

// UnitTest();

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘


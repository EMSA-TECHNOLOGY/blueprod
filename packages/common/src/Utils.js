/*#*
***************************************************************************************************
** Copyright © 2018 EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** License:       MIT
**
** File:          utils.js
** Version:       0.1
** Author:        <href="mailto:thanhlq@emsa-technology.com"> Thanh LE</a>
**
** Description:
***************
** An class that contain very common methods used cross modules.
**
** History:
***********
** Version 0.1  2018/05/08 09:00:00 (GMT+7)  thanhlq
**   + Creation and implementation.
***************************************************************************************************
*#*/

/** @module Utils */

'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const _ = require('lodash');
const uuid = require('uuid/v4');
const fs = require('fs');
const path = require('path');
const validator = require('validator');
const mkdirp = require('mkdirp');
const DatetimeUtil = require('./Datetime');
const crypto = require('crypto');

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 * The class contains very common functions used across modules.
 *
 * @class
 * @constructor
 */
const Utils = {
  json                                  : json,
  jsonPretty                            : jsonPretty,
  validator                             : validator,
  datetime                              : DatetimeUtil,
  arrayToTree                           : arrayToTree,
  treeToArray                           : treeToArray,
  mkdirSync                             : mkdirSync,
  findFiles                             : findFiles,
  findFilesSync                         : WalkSync,
  findDirsSync                          : findDirsSync,
  join                                  : path.join,
  uuid                                  : randomUUID,
  deepClone                             : (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },
  isExistedFileSync                     : isExistedFileSync,
  parseBoolean                          : parseBoolean,
  parseInt                              : jsParseInt,
  copyHTTPFormDataObject                : copyHTTPFormDataObject,
  buildGravatarUrl                      : buildGravatarUrl,
  joinUrls                              : joinUrls,
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = Utils;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

function joinUrls(url1, url2, url3, url4) {
  let url = join2Urls(url1, url2);

  if (url3) {
    url = join2Urls(url, url3);
  }

  if (url4) {
    url = join2Urls(url, url4);
  }
  return url;
}

function join2Urls(url1, url2) {
  let url;
  if (url1.endsWith('/') || url2.startsWith('/')) {
    url = url1 + url2;
  } else {
    url = url1 +'/' +url2;
  }
  return url;
}

function json(obj) {
  return JSON.stringify(obj);
}

function jsonPretty(obj, indents = 2) {
  return JSON.stringify(obj, null, indents);
}

/**
 * Accept string i.e. 'true'
 *
 * @param boolVal
 * @return {boolean}
 */
function parseBoolean(boolVal) {
  if (typeof boolVal === 'boolean') {
    return boolVal;
  }

  if (_.isString(boolVal) && boolVal.length > 0) {
    let val = boolVal.toLowerCase();
    return (val === 'true');
  }

  return false;
}

function jsParseInt(pVal) {
  return parseInt(pVal);
}

function isExistedFileSync(fileOrDir) {
  return fs.existsSync(fileOrDir);
}

/**
 *
 * @param removeDash
 * @return {*}
 */
function randomUUID(removeDash = false) {
  if (removeDash) {
    return uuid().replaceAll('-', '');
  } else {
    return uuid();
  }
}

function mkdirSync(dir) {
  return mkdirp.sync(dir);
}

/**
 * File files in a directory - recursively is supported.
 *
 * @param dir
 * @param opts
 * @param opts.recursive {Boolean}      Default false
 * @param opts.extension  {[String]}    Default empty
 * @param done
 */
function findFiles(dir, opts = {}, done) {
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
      fs.stat(file, function (err2, stat) {
        if (stat && stat.isDirectory()) {
          if (opts.recursive) {
            findFiles(file, opts, function (err3, res) {
              results = results.concat(res);
              next();
            });
          }
        } else {
          if (extensions.length < 1) {
            results.push(file);
          } else {
            let basename = path.basename(file);
            for (let j = 0; j < extensions.length; j++) {
              if (basename.endsWith(extensions[j])) {
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
}

/**
 *
 * @param dir
 * @param outputFileList
 * @param opts
 * @param opts.extensions
 * @param opts.recursive
 *
 * @return {*|Array}
 * @constructor
 */
function WalkSync(dir, outputFileList, opts = {}) {
  let files = fs.readdirSync(dir);
  let extensions = opts.extensions || [];
  let recursive = (opts.recursive === false ? opts.recursive : true);

  extensions = Array.isArray(extensions) ? extensions : [extensions];

  outputFileList = outputFileList || [];

  files.forEach(function (file) {
    let stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (recursive) {
        outputFileList = WalkSync(path.join(dir, file), outputFileList, opts);
      } else {
        /* Just ignored */
      }
    } else {
      if (extensions.length < 1) {
        outputFileList.push(path.join(dir, file));
      } else {
        let fileExt = path.extname(file);
        if (extensions.indexOf(fileExt) >= 0) {
          outputFileList.push(path.join(dir, file));
        } else {
          /* ignored file */
        }
      }
    }
  });

  return outputFileList;
}

/**
 *
 * @param dir
 * @param dirList output found dirs.
 * @param opts
 */
function findDirsSync(dir, dirList, opts = {}) {
  let files = fs.readdirSync(dir);

  dirList = dirList || [];

  files.forEach(function (file) {
    let stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      dirList.push(file);
    } else {
      /* ignore */
    }
  });

  return dirList;
}

function arrayToTree(list, idField = '_id', parentField = 'parentId') {
  const map = {}, roots = [];
  let node;

  let len = list.length;
  for (let i = 0; i < len; i += 1) {
    map[list[i][idField]] = i; // initialize the map
    list[i].children = []; // initialize the children
  }

  len = list.length;
  for (let i = 0; i < len; i += 1) {
    node = list[i];
    if (node[parentField]) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node[parentField]]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function treeToArray(tree, outputList, childrenField = 'children') {
  outputList = outputList || [];

  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      let node = tree[i];
      outputList.push(node);
      let children = node[childrenField];
      if (children && children.length > 0) {
        treeToArray(children, outputList, childrenField);
      } else {
        delete node[childrenField];
      }
    }
  } else {
    for (let p in tree) {
      if (tree.hasOwnProperty(p)) {
        let node = tree[p];
        outputList.push(node);
        let children = node[childrenField];
        if (children && children.length > 0) {
          treeToArray(children, outputList, childrenField);
        } else {
          delete node[childrenField];
        }
      }
    }
  }

  return outputList;
}

/**
 *
 * @param template    {*} Template can be string/array of fields i.e
 *  + "firstName, lastName"
 *  + ["firstName, lastName"]
 *  + {firstName: null, lastName: null}
 * @param formData
 * @param desObject
 */
function copyHTTPFormDataObject(template, formData, desObject = {}) {
  if (!formData || _.isEmpty(formData)) {
    return desObject;
  }
  let fields;
  if (_.isString(template)) {
    fields = template.split(' ');
  } else if (_.isArray(template)) {
    fields = template;
  } else if (_.isObject(template)) {
    for (let p in template) {
      if (template.hasOwnProperty(p)) {
        let val = formData[p];
        if (val !== undefined) {
          template[p] = val;
        }
      }
    }
    return template;
  } else {
    throw new Error(`Cannot copy data, invalid template provided!`);
  }

  fields.forEach((p) => {
    let val = formData[p];
    if (val !== undefined) {
      desObject[p] = val;
    }
  });
  return desObject;
}

function buildGravatarUrl(email) {
  const md5 = crypto.createHash('md5');
  md5.update(email || '');
  return 'https://gravatar.com/avatar/' + md5.digest('hex');
}

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

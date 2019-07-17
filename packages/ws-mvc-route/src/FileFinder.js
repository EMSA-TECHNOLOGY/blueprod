/*#*
***************************************************************************************************
** Copyright © 2016 EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** This software is the proprietary information of EMSA TECHNOLOGY COMPANY LTD and ÉOLANE. Unauthorized
** copying of this file, via any medium is strictly prohibited proprietary and confidential.
**
** File:         FileFinder.js
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

const fs = require('fs');
const path = require('path');

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
const WalkSync = function (dir, outputFileList, opts = {}) {
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
module.exports.findFiles = function findFiles(dir, opts = {}, done) {

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
            findFiles(file, opts, function (err, res) {
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

module.exports.findFileSync = function (dir, outputFileList, opts = {}) {
  return WalkSync(dir, outputFileList, opts);
};

/**
 * Get all directories in a directory.
 *
 * @param parentDir
 * @returns {Promise} promise object, the promise gets one argument (dirs) where dirs is an array of all directories
 */
module.exports.readDirs = function readDirs(parentDir) {
  return new Promise(function (resolve, reject) {
    fs.readdir(parentDir, function (err, files) {
      if (err) {
        reject(err);
      } else {
        const dirs = [];
        files.forEach(function (file) {
          if (fs.lstatSync(path.join(parentDir, file)).isDirectory()) {
            dirs.push(file);
          }
        });
        resolve(dirs);
      }
    });
  })
};

/**
 * Get all directories in a directory. Not recursively.
 *
 * @param dir
 * @return {Array}
 */
module.exports.readDirsSync = function readDirsSync(dir) {

  const dirs = fs.readdirSync(dir);
  const results = [];
  dirs.forEach(function (file) {
    if (fs.lstatSync(path.join(dir, file)).isDirectory()) {
      results.push(file);
    }
  });

  return results;
};

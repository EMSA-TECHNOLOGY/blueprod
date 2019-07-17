'use strict';

const _ = require('lodash');
const util = require('util');
const includeAll = require('include-all');
const path = require('path');
const debug = require('debug')('ws-mvc-route');

/**
 * Class to load API all provided controllers.
 *
 * @class
 * @constructor
 */
const PolicyLoader = function (opts) {
  this.opts = opts || {};
};

module.exports = PolicyLoader;

/**
 * This shall load all controllers available under defined controller directory (opts.controllerDirs).
 *
 * The result shall be the object contain all loaded controller, the object key is the controller name (i.e. authcontroller)
 *
 * @param opts
 * @param opts.policyDirs
 * @param opts.rootAppPath
 * @param opts.logger
 *
 * @return {Promise.<{Object}>}
 */
PolicyLoader.prototype.load = async (opts) => {
  opts = opts || this.opts || {};
  const rootAppPath = opts.rootAppPath || process.env["ROOT_APP_PATH"];
  let foundObjectPolicies = {};
  let policyDirs = opts.policyDirs || ['api/policies'];
  policyDirs = (Array.isArray(policyDirs) ? policyDirs : [policyDirs]);

  for (let i = 0; i < policyDirs.length; i++) {
    let tempDir = policyDirs[i];
    let fullPolicyDir;

    if (path.isAbsolute(tempDir)) {
      fullPolicyDir = tempDir;
    } else {
      fullPolicyDir = path.join(rootAppPath, tempDir);
    }

    debug('Loading policies in: ' + fullPolicyDir);
    const iaOptions = {
      dirname: fullPolicyDir,
      filter: /(.+)\.js$/,
      excludeDirs: /^\.(git|svn)$/
    };
    const includeAllOptional = util.promisify(includeAll.optional);
    try {
      const includes = await includeAllOptional(iaOptions);
      foundObjectPolicies = _.merge(foundObjectPolicies, includes || {});
    } catch (ex) {
      debug(`Error when loading policies!`, ex);
      throw ex;
    }
  }

  return foundObjectPolicies;
};

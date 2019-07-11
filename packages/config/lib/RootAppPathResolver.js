'use strict';

module.exports = function (dirname) {
  const path = require('path');
  const resolve = require('./Resolver.js');
  let appRootPath = resolve(dirname);

  const publicInterface = {
    resolve: function (pathToModule) {
      return path.join(appRootPath, pathToModule);
    },

    require: function (pathToModule) {
      return require(publicInterface.resolve(pathToModule));
    },

    toString: function () {
      return appRootPath;
    },

    setPath: function (explicitlySetPath) {
      appRootPath = path.resolve(explicitlySetPath);
      publicInterface.path = appRootPath;
    },

    path: appRootPath
  };

  return publicInterface;
};

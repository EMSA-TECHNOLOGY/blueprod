'use strict';

const _ = require('lodash');
const log = require('@js8/logger')('RouteMiddlewarePolicy');

/**
 * This middleware operates based on the controllers and route paths so it must be bound into a user route (since it uses
 * some MVC features).
 *
 * @param wsApp
 * @param wsApp.policies          {Object} User's defined policies.
 * @param wsApp.policyMiddlewares {Object} all users's defined policies middlewares (i.e. async auth(ctx, next))
 * @param wsApp.PolicyManager     {Object}
 * @return {*}
 */
module.exports = function mRouteMiddlewarePolicy(wsApp /* ws, opts = {}*/) {
  const policies = wsApp.policies;

  if (!_.isEmpty(policies) && !_.isObject(policies)) {
    throw new TypeError(`Invalid user defined policies!`);
  }

  if (!_.isEmpty(policies)) {
    if (!_.isEmpty(wsApp.policyMiddlewares)) {
      return async function mPolicyMiddleware(ctx, next) {
        // if (ctx._matchedRoute && ctx.options) {
        //   let fn = wsApp.policyMiddlewares[ctx.options.actionId] || wsApp.policyMiddlewares['*'];
        //   if (fn) {
        //     try {
        //       return fn(ctx, next);
        //     } catch (errPolicy) {
        //       log.error(`Error when invoke policy!`, errPolicy);
        //       throw errPolicy;
        //     }
        //   }
        // }
        // return next();

        return wsApp.PolicyManager.applyPolicyOnRequest(wsApp, ctx, next);
      }/* mPolicyMiddleware */;
    } else {
      /* Do nothing */
    }
  } else {
    /* Do nothing */
  }
};

/*
module.exports.policies = {
  UserController: {
    // By default, require requests to come from a logged-in user
    // (runs the policy in api/policies/isLoggedIn.js)
    '*': 'isLoggedIn',

    // Only allow admin users to delete other users
    // (runs the policy in api/policies/isAdmin.js)
    'delete': 'isAdmin',

    // Allow anyone to access the login action, even if they're not logged in.
    'login': true
  }
};

=================

module.exports.policies = {
  'user/*': 'isLoggedIn',
  'user/delete': 'isAdmin',
  'user/login': true
}

Policy ordering and precedence
# It is important to note that policies do not “cascade”. In the examples above, the isLoggedIn policy will be applied
to all actions in the UserController.js file (or standalone actions living under api/controllers/user ) except for delete and login. If you wish to apply multiple policies to an action, list the policies in an array, for example:
'getEncryptedData': ['isLoggedIn', 'isInValidRegion']

=================
module.exports.policies = {
  UserController: {
    // Apply the 'isLoggedIn' policy to the 'update' action of 'UserController'
    update: 'isLoggedIn'
  }
};

module.exports.policies = {
  'user/update': 'isLoggedIn'
};
Global policies
#

You can apply a policy to all actions that are not otherwise explicitly mapped by using the * property. For example:

module.exports.policies = {
  '*': 'isLoggedIn',
  'user/login': true
};
 */

'use strict';

const _ = require('lodash');
const log = require('@blueprod/logger')('PolicyManager');
const config = require('@blueprod/config');
const wsConstants = require('./WsConstants');

// Thanh LE

/**
 * The class for managing of the user policy middlewares.
 *
 * @param wsApp The WebServiceApplication instance.
 *
 * @constructor
 */
const PolicyManager = function (wsApp) {
  this.WebServiceApplication = wsApp;

  if (!_.isEmpty(wsApp.policies)) {
    /* Shall contain an object with {key: actionId, value: composed-policy-middlewares}. */
    this.policyMiddlewares = wsApp.policyMiddlewares = this.buildUserDefinedPolicies(wsApp.policies, wsApp.controllers);
    log.debug('Built all needed policy middlewares');
  } else {
    log.info('No user defined policies found!');
  }
};

PolicyManager.TruePolicy = async function (ctx, next) {
  ctx._policyApplied = true;
  return next();
};

/**
 * Send the forbidden if the request is NOT authenticated.
 *
 * @param ctx
 * @param next
 * @return {Promise.<*>}
 * @constructor
 */
PolicyManager.FalsePolicy = async function (ctx, next) {
  if (!ctx.isAuthenticated || !ctx.isAuthenticated()) {
    if (ctx.forbidden && _.isFunction(ctx.forbidden)) {
      ctx.forbidden();
    } else {
      ctx.status = wsConstants.STATUS_CODE.FORBIDDEN;
      ctx.body = wsConstants.STATUS_CODE.getStatusText(ctx.status);
    }
  } else {
    ctx._policyApplied = true;
    return next();
  }
};

/**
 * This function will build an object contain {key: actionId, value: being-applied-policy-middlewares} which
 * is ready to execute.
 *
 * @param policies      {Object} Contains all policies, object key: policy name/file name, object value: policy fn
 * @param controllers;  {Object} Contains all controller objects
 * @return {{}}
 */
PolicyManager.prototype.buildUserDefinedPolicies = function (policies, controllers = {}) {
  const self = this;
  const policyRule = config.get('http.policies', {});
  const executablePolicyMiddlewares = {};

  if (_.isEmpty(policyRule)) {
    return policyRule;
  }

  if (!_.isObject(policyRule)) {
    throw new TypeError('Invalid policy rules definition!');
  }

  const checkPolicyExisted = function (policy) {
    if (_.isString(policy)) {
      /* A single policy */
      if (!policies[policy]) {
        throw new Error(`Invalid policy definition, policy does not exist: ${policy}`);
      }
    } else if (_.isArray(policy)) {
      if (policy.length > 0) {
        /* Validate policy */
        policy.forEach((pol) => {
          if (!_.isString(pol) || !policies[pol]) {
            throw new Error(`Invalid policy definition: ${key}`);
          }
        });
      } else {
        throw new Error(`Invalid policy definition, not policies defined: ${key}`);
      }
    }
  };

  const pushPolicyRule = function (polKey, polRule) {
    if (polKey === '*') {
      /* Apply to all actions */
      checkPolicyExisted(polRule);
      executablePolicyMiddlewares[polKey] = self.buildComposedPolicyMiddlewareForAction(policies, polRule);
    } else if (_.isObject(polRule)) {
      /* controller object */
      let controllerId = polKey.toLowerCase().replace('controller', '');
      for (let action in polRule) {
        if (polRule.hasOwnProperty(action)) {
          let pol = polRule[action];
          checkPolicyExisted(pol);
          let actionId = controllerId + '.' + action.toLowerCase();
          executablePolicyMiddlewares[actionId] = self.buildComposedPolicyMiddlewareForAction(policies, pol);
        }
      }
    } else {
      /* i.e. UserController/delete */
      const controllerAction = polKey.split('/');
      if (!_.isArray(controllerAction) || controllerAction.length !== 2) {
        throw new TypeError(`Invalid policy rule definition, wrong format [controller/action]: ${polKey}`);
      }

      let ctlId = controllerAction[0].toLowerCase().replace('controller', '');
      let ctl = controllers[ctlId];

      if (!ctl) {
        throw new TypeError(`Invalid policy rule definition, no controller found: ${controllerAction[0]}`);
      }

      if (!ctl[controllerAction[1]]) {
        throw new TypeError(`Invalid policy rule definition, no action found: ${ctl[controllerAction[1]]}`);
      }

      let actionId = ctlId + '.' + controllerAction[1].toLowerCase();
      executablePolicyMiddlewares[actionId] = self.buildComposedPolicyMiddlewareForAction(policies, polRule);
    }
  };

  for (let key in policyRule) {
    if (policyRule.hasOwnProperty(key)) {
      const rule = policyRule[key];
      pushPolicyRule(key, rule);
    }
  }

  return executablePolicyMiddlewares;
};

/**
 * An function to a composed middleware (Koa executable middleware) based on the being applied policies name.
 *
 * @param policies          {Object}    The object contains all user policy middlewares (key: policy name, value: policy middleware).
 * @param beingAppliedPolicyNames  {*}  The policy shall be applied to the action id.
 * @return {Function}                   Executable Koa middleware.
 */
PolicyManager.prototype.buildComposedPolicyMiddlewareForAction = function (policies, beingAppliedPolicyNames) {
  const appliedPolicies = [];
  if (beingAppliedPolicyNames === true) {
    appliedPolicies.push(PolicyManager.TruePolicy);
  } else if (beingAppliedPolicyNames === false) {
    appliedPolicies.push(PolicyManager.FalsePolicy);
  } else {
    beingAppliedPolicyNames = (Array.isArray(beingAppliedPolicyNames) ? beingAppliedPolicyNames : [beingAppliedPolicyNames]);
    beingAppliedPolicyNames.forEach((polName) => {
      appliedPolicies.push(policies[polName]);
    });
  }
  return require('koa-compose')(appliedPolicies);
};

PolicyManager.prototype.applyPolicyOnRequest = async function (wsApp, ctx, next = () => {
}) {
  if (ctx._matchedRoute && ctx.options) {
    let fn = wsApp.policyMiddlewares[ctx.options.actionId] || wsApp.policyMiddlewares['*'];
    if (fn) {
      try {
        return fn(ctx, next);
      } catch (errPolicy) {
        log.error(`Error when invoke policy!`, errPolicy);
        throw errPolicy;
      }
    }
  }

  return next();
};

module.exports = PolicyManager;

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
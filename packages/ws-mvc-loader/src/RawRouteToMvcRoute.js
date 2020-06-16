// Thanh LE EMSA TECHNOLOGY

// Utility to build MVC route (action, controller,...) from a user defined route (raw route).

const _ = require('lodash');
const Verbs = require('./Verbs');
const logger = require('@blueprod/logger')('ws-mvc-loader');

module.exports = function (routes, controllers) {
  const builtRoutes = {};

  for (let path in routes) {
    if (!routes.hasOwnProperty(path)) {
      continue;
    }

    let targets = routes[path];
    let args;
    if (targets.method && targets.path) {
      args = {
        verb: targets.method,
        path: targets.path,
      }
    } else {
      args = sanitize(path, targets);
    }
    let httpVerb = args.verb || 'ALL';
    let verb = Verbs.userVerb2KoaVerb(args.verb || 'ALL');

    const builtTarget = parseRouteTarget(path, targets, controllers);

    if (builtTarget) {
      builtTarget.verb = verb;
      builtTarget.path = args.path;
      builtTarget.verb = verb;
      builtTarget.originalPath = path;
      builtTarget.httpVerb = httpVerb;
      /* IMPORTANT: no space between verb & api path */
      builtRoutes[`${verb.toUpperCase()}${args.path}`] = builtTarget;
    }
  }

  return builtRoutes;
};

/**
 * For example: 'UserController.createUser' shall be output: {action: createUser, controllerId: user}
 */
function parseAction(action) {
  if (action && _.isString(action) && action.indexOf('.') > 0) {
    action = action.trim();
    let parts = action.split('.');
    let result = {
      action: parts[1],
      controllerId : parts[0].toLowerCase().replace('controller', ''),
    };
    result.actionId = result.controllerId +'.' +result.action.toLowerCase();

    return result;
  }

  return {};
}

/**
 * Parse a user route definition (path, target).
 *
 * @param routePath     {String}  The user route path i.e. "GET /users"
 * @param target        {*}       Can be various as "Controller.action", "users/action", object type as {view: "user.ejs", layout: "user-profile.ejs"}.
 * @param controllers   {Object}  The needed controller object (<controllerId, controllerObject>), Needed in the case the target is controller/action.
 *
 * @return {*}    The parsed MVC route object that contains all needed information for binding.
 */
function parseRouteTarget (routePath, target, controllers) {

  const targetInfo = {
    /* may be:
      - controllerId, action (fn name), actionId
      - view, layout
      - fn (handler function)
     */
    originalTarget : target
  };

  if (_.isString(target)) {
    /* e.g. user.authenticate */
    if (target.indexOf('.') > 0) {
      // const controllerAction = target.split(".");
      // const controllerId = controllerAction[0].toLowerCase().replace('controller', '');
      // const action = controllerAction[1];
      // const actionId = `${controllerId}.${action}`;

      _.extend(targetInfo, parseAction(target));
      const controller = controllers[targetInfo.controllerId];

      if (!controller) {
        logger.warn(`Controller is not found: ${targetInfo.controllerId}, ignored route: ${routePath}!`);
        return false;
        /* parse fail */
      }

      targetInfo.fn = controller[targetInfo.action];

      if (!targetInfo.fn) {
        logger.warn(`Controller action is not found: ${targetInfo.controllerId}/${targetInfo.action}, ignored route: ${routePath}!`);
        return false;
        /* parse fail */
      }

      // targetInfo.action = action;
      // targetInfo.controllerId = controllerId;
      // targetInfo.actionId = actionId;
      targetInfo.controller = controller;
    } else {
      logger.warn('Ignored unknown route target: ' + target);
    }
  } else if (_.isArray(target)) {
    /* Rarely... to be supported later */
    logger.error(`Unsupported route target array type, ignored route: ${routePath}!`);
    return false;
  } else if (_.isObject(target)) {
    _.extend(targetInfo, target);
    /* handler: "product.create" */
    target.controller = target.controller || target.handler;

    if (target.action && target.controller) { /* controller = user, action = create */
      target.controllerId = target.controller;
    } else if (target.action) { /* user.create */
      _.extend(targetInfo, parseAction(target.action));
    } else if (target.controller) { /* user.create */
      _.extend(targetInfo, parseAction(target.controller));
    }

    if (target.view) {
      /* do nothing */
    } else if (target.fn) {
      if (!_.isFunction(target.fn)) {
        logger.error(`Invalid user response handler - the handler must be a function type, ignored route: ${routePath}!`);
        return false;
      } else {
        /* do nothing since, user defined directly an action */
      }
    } else if (target.action || target.controller) {
      targetInfo.controllerId = targetInfo.controllerId || target.controller.toLowerCase().replace('controller', '');
      targetInfo.controller = controllers[targetInfo.controllerId];

      if (!targetInfo.controller) {
        logger.error(`Controller is not found: ${target.controller}, ignored route: ${routePath}!`);
        return false;
        /* parse fail */
      }
      targetInfo.fn = targetInfo.controller[targetInfo.action];
      if (!targetInfo.fn) {
        logger.error(`Controller handler is not found: [${targetInfo.actionId}], ignored route: ${routePath}!`);
        return false;
        /* parse fail */
      }
      targetInfo.actionId = targetInfo.actionId || (targetInfo.controllerId +'.' +targetInfo.action.toLowerCase());
    } else {
      logger.error(`Invalid route target definition: ${JSON.stringify(target)}, ignored route: ${routePath}!`);
      return false;
    }
  } else if (_.isFunction(target)) {
    targetInfo.fn = target;
  } else {
    logger.error(`Invalid route target definition type: ${typeof target}, ignored route: ${routePath}!`);
    return false;
  }

  return targetInfo;
}

const verbExpr = /^(all|get|post|put|delete|trace|options|connect|patch|head)\s+/i;

function detectVerb(haystack) {
  let verbSpecified = _.last(haystack.match(verbExpr) || []) || '';

  verbSpecified = verbSpecified.toLowerCase();

  // If a verb was specified, eliminate the verb from the original string
  if (verbSpecified) {
    haystack = haystack.replace(verbExpr, '');
  }

  return {
    verb: verbSpecified,
    original: haystack,
    path: haystack
  };
}

function sanitize(path, target, verb, options) {
  options = options || {};

  // If trying to bind '*', that's probably not what was intended, so fix it up
  path = path === '*' ? '/*' : path;

  // If route has an HTTP verb (e.g. `get /foo/bar`, `put /bar/foo`, etc.) parse it out,
  const detectedVerb = detectVerb(path);
  // then prune it from the path
  path = detectedVerb.original;
  // Keep track of parsed verb so we know if it was specified later
  options.detectedVerb = detectedVerb;

  // If a verb override was not specified,
  // use the detected verb from the string route
  if (!verb) {
    verb = detectedVerb.verb;
  }

  return {
    path: path,
    target: target,
    verb: verb,
    options: options
  };
}

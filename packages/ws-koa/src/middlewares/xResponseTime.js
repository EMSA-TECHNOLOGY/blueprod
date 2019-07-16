'use strict';

// Thanh LE

async function xResponseTime(ctx, next) {
  const start = Date.now();
  /* Support this for external middleware usage in the case */
  ctx._startTime = start;
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
}

module.exports = function WsxResponseTime(/* ws, opts = {}*/) {
  return xResponseTime;
};

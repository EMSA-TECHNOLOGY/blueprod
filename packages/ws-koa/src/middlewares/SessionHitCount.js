'use strict';

/* Security: A simple middleware to count user hits */

module.exports = async function (ctx, next) {
  // ignore favicon
  if (ctx.path !== '/favicon.ico') {
    let n = ctx.session.hits || 0;
    ctx.session.hits = ++n;
    // ctx.cookies.set('cookies-test-var1', n);
    //
    // if (ctx.session.isNew) {
    //   debug(`New session: ${ctx.cookies[SESSION_PREFIX]}`);
    // } else {
    //   debug(`Old session: ${ctx.cookies[SESSION_PREFIX]}`);
    // }

    // await next();
  }

  return next();
};

'use strict';

// Thanh LE

/**
 * Passport's values and methods are exposed as follows:

 app.use(async ctx => {
  ctx.isAuthenticated()
  ctx.isUnauthenticated()
  await ctx.login()
  ctx.logout()
  ctx.state.user
})
 * @param wsApp
 */
module.exports = function AuthenticationMiddleware(wsApp) {
  const passport = require('koa-passport');
  wsApp.app.use(passport.initialize());
  wsApp.app.use(passport.session());
  wsApp.passport = passport;
};

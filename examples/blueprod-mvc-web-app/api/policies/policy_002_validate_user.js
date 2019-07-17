
module.exports = async function policyPrepareView(ctx, next) {
  ctx.query = ctx.query || {};

  if (!ctx.query.username) {
    ctx.body = 'cannot create user, username is not provided!'
  } else {
    /* continue application controller */
    await next();
  }
};

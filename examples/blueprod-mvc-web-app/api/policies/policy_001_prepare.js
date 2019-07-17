module.exports = async function policyPrepareView(ctx, next) {
  let req = ctx.request;
  let res = ctx.response;
  res.state = res.state || {};
  res.state._etFrontendConfig = {
    username: 'thanhlq'
  };
  console.log('policyPrepareView invoked!');
  await next();
};

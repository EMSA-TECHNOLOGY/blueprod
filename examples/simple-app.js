const ws = require('../packages/ws-koa/src');
const KoaWebServiceApplication = ws.KoaWebServiceApplication;

const app = new KoaWebServiceApplication(null, {
  config: require('@blueprod/config').load({rootAppPath: __dirname})
});

app.get('/hello', async(ctx)=> {
  ctx.body = 'hello there!';
});

app.start(21400);

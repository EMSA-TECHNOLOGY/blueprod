const ws = require('../../packages/ws-koa/src');

// const app = new KoaWebServiceApplication({config: require('@blueprod/config').load({rootAppPath: __dirname})});
const app = new ws.KoaWebServiceApplication();
let count = 1;

app.get('/hello', async(ctx)=> {
  ctx.body = 'hello there ' +count++;
  console.log('Request count: ' +count);
});

app.start(21400);

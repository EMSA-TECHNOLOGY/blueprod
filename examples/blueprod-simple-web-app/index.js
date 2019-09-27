// const ws = require('"@blueprod/ws-koa": "^0.1.0"');
// const app = new ws.KoaWebServiceApplication();

const ws = require('../../packages/ws-koa/src');
const app = new ws.KoaWebServiceApplication({config: require('@blueprod/config').load({rootAppPath: __dirname})});

let count = 1;

app.get('/hello', async(ctx)=> {
  ctx.body = 'hello there ' +count++;
  console.log('Request count: ' +count);
});

app.start(21400);

console.log("Checking out the api at this url: http://localhost:21400/hello");
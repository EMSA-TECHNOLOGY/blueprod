// const ws = require('"@blueprod/ws-koa": "^0.1.0"');
// const app = new ws.KoaWebServiceApplication();

process.env['DEBUG']='ws-mvc-route';

const ws = require('../../packages/ws-koa/src');
const MVC = require('../../packages/ws-mvc-route/src');
const app = new ws.KoaWebServiceApplication({config: require('@blueprod/config').load({rootAppPath: __dirname})});

let count = 0;
let routeCount = 1;

app.get('/hello', async(ctx)=> {
  count++;
  ctx.body = 'hello there ' +count;
  console.log('Request count: ' +count);
});

app.get('/addRoute', async(ctx)=> {
  routeCount++;

  app.get('/newRoute' +routeCount, async(ctx2)=> {
    count++;
    ctx2.body = 'New route: ' +count;
    console.log('Request count: ' +count);
  });

  ctx.body = 'Added a new route /newRoute' +routeCount;
  // app.app.close();
  // app.app.listen(21400);
});

async function startApp() {
  const mvc = new MVC(app);
  await mvc.load();
  await app.start({port: 21400});
}

startApp();

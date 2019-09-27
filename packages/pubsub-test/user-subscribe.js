const path = require('path');
const { performance } = require('perf_hooks');
const hostConf = require('./config/host-config');

const rootAppPath = path.join(process.cwd(), '');
const config = require('@blueprod/config').load();
process.env["NODE_ENV"] = 'development';

// process.env["REDIS_HOST"] = 'redis';
// process.env["REDIS_PORT"] = 'port';

config.reload({rootAppPath});

let pubsubService = require('@blueprod/pubsub');

const authObj = {
  name: hostConf.NAME,
  host: config.get(hostConf.HOST),
  port: config.get(hostConf.PORT),
};

let services = pubsubService(authObj);


console.log(`RUNNING WITH [${hostConf.NAME}]..................`);

const listener = (msg) => {
  const t3 = performance.now();
  console.log('Received a message: ' + msg + ' take ' + (t3-t1) + ' milliseconds');
};

// const listener1 = (msg) => {
//   const t4 = performance.now();
//   console.log('Received a message: ' + msg + ' take ' + (t4-t2) + ' milliseconds');
// };

const t1 = performance.now();
console.log('Starting listen on topic [foo]');
services.on('foo', listener);

console.log('Starting listen on topic [foo1]');
services.on('foo1', listener);

// const t2 = performance.now();
// console.log('Starting listen on topic [foo]');
// services.on('foo1', listener1);

setTimeout(function () {
  console.log("unsubscribe topic [foo]");
  services.unsubscribe('foo');
},10000);

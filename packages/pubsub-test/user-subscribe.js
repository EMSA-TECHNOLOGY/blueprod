process.env["NODE_ENV"] = 'test';

const path = require('path');
const { performance } = require('perf_hooks');

const rootAppPath = path.join(process.cwd(), '');
const config = require('@blueprod/config').load({rootAppPath});

let pubsubService = require('@blueprod/pubsub');

const TEST_SERVER = config.properties.TEST_SERVER;
const authObj = {
  name: TEST_SERVER.NAME,
  host: config.get(TEST_SERVER.HOST),
  port: config.get(TEST_SERVER.PORT),
};

let services = pubsubService(authObj);

console.log(`RUNNING WITH [${TEST_SERVER.NAME}]..................`);

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

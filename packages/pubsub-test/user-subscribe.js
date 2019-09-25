const path = require('path');
const rootAppPath = path.join(process.cwd(), '');
const config = require('@blueprod/config');
process.env["NODE_ENV"] = 'development';
config.reload({rootAppPath});

let services = require('@blueprod/pubsub');

const authObj = {
  host: config.get('REDIS_HOST'),
  port: config.get('REDIS_PORT'),
};
services.createConnection(authObj);

const listener = (msg) => {
  console.log('Received a message: ' + msg);
};

const listener1 = (msg) => {
  console.log('Received a message: ' + msg +111111);
};

services.on('foo', listener);
// services.on('foo', listener1);

services.on('foo1', listener1);

// setTimeout(function () {
//   console.log("unsubscribe");
//   services.unsubscribe('foo');
// },10000);

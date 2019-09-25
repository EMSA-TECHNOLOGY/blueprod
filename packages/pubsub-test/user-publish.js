const path = require('path');
const rootAppPath = path.join(process.cwd(), '');
const config = require('@blueprod/config');
process.env["NODE_ENV"] = 'development';
config.reload({rootAppPath});
const constants = {
  /* To add constants here */
  REDIS: 'redis',
  NATS: 'nats',
};
var services = require('@blueprod/pubsub')(constants.NATS);

let authObj = {
  host: config.get('REDIS_HOST'),
  port: config.get('REDIS_PORT'),
};

setTimeout(function () {
  services.createConnection(authObj);
// Simple Publisher
  services.emit('foo', 'Hello World!');
  services.emit('foo1', 'Hello World!');
}, 1000);



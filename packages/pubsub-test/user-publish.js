const path = require('path');
const rootAppPath = path.join(process.cwd(), '');
const config = require('@blueprod/config').load();
process.env["NODE_ENV"] = 'development';
config.reload({rootAppPath, debug: true});

var services = require('../pubsub/src/blueprod-pubsub');
let authObj = {
  host: config.get('NATS_HOST'),
  port: config.get('NATS_PORT'),
};

services.createConnection(authObj);
// Simple Publisher
services.emit('foo', 'Hello World!');
services.emit('foo1', 'Hello World!');

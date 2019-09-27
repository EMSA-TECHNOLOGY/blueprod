const path = require('path');
const hostConf = require('./config/host-config');

const rootAppPath = path.join(process.cwd(), '');
const config = require('@blueprod/config').load();
process.env["NODE_ENV"] = 'development';
config.reload({rootAppPath});

let pubsubService = require('@blueprod/pubsub');

const authObj = {
  name: hostConf.NAME,
  host: config.get(hostConf.HOST),
  port: config.get(hostConf.PORT),
};

let services = pubsubService(authObj);

services.emit('foo', 'Hello World!');
services.emit('foo1', 'Hello World!');

const path = require('path');
const hostConf = require('./config/host-config');

const rootAppPath = path.join(process.cwd(), '');
const config = require('@blueprod/config');
process.env["NODE_ENV"] = 'development';
config.reload({rootAppPath});

let services = require('@blueprod/pubsub')(hostConf.NAME);

const authObj = {
  host: config.get(hostConf.HOST),
  port: config.get(hostConf.PORT),
};

setTimeout(function () {
  services.createConnection(authObj);
// Simple Publisher
  services.emit('foo', 'Hello World!');
  services.emit('foo1', 'Hello World!');
}, 1000);



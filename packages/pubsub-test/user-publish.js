process.env["NODE_ENV"] = 'test';

const path = require('path');
const rootAppPath = path.join(process.cwd(), '');
const config = require('@blueprod/config').load({rootAppPath, debug: true});
// config.reload({rootAppPath});

const TEST_SERVER = config.properties.TEST_SERVER;

const authObj = {
  name: TEST_SERVER.NAME,
  host: config.get(TEST_SERVER.HOST),
  port: config.get(TEST_SERVER.PORT),
};

const pubsubService = require('@blueprod/pubsub');
let services = pubsubService(authObj);

services.emit('foo', 'Hello World!');
services.emit('foo1', 'Hello World!');

var services = require('../pubsub/src/blueprod-pubsub');

let authObj = {
  host: "192.168.0.123",
  port: 6379
};
services.createConnection(authObj);
// Simple Publisher
services.emit('foo', 'Hello World!');
services.emit('foo1', 'Hello World!');

var services = require('../pubsub/src/blueprod-pubsub');

// Simple Publisher
services.emit('foo', 'Hello World!');

var services = require('../pubsub/src/blueprod-pubsub');

services.on('foo', function(msg) {
  console.log('Received a message: ' + JSON.stringify(msg));
  services.unsubscribe();
});

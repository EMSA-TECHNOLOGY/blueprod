var services = require('../pubsub/src/blueprod-pubsub');

let authObj = {
  host: "192.168.0.123",
  port: 6379,
};
services.createConnection(authObj);

let listener = (msg) => {
  console.log('Received a message: ' + msg);
};

let listener1 = (msg) => {
  console.log('Received a message: ' + msg +111111);
};



services.on('foo', listener);
// services.on('foo', listener1);

services.on('foo1', listener1);

// setTimeout(function () {
//   console.log("unsubscribe");
//   services.unsubscribe('foo');
// },10000);

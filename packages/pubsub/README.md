## blueprod-pubsub

This module allows you to publish/subscribe the message in your application:

## How To Use

- **@blueprod/pubsub** support the user to pass which module they want (redis/nats/kafka).

```javascript
const pubsubService = require('@blueprod/pubsub');
// You have to provide the *opt* when use the @blueprod/pubsub
const opt = {
  name: 'redis', // (nats/kafka) -> default: redis
  host: '127.0.0.1', // default: localhost
  port: 6379 // default: redis-6379, nats-4222, kafka-9092
  // user, password... -> Not support kafka yet.
};
// If you don't pass the opt.host and opt.port, each module will use the default value above
let services = pubsubService(opt);  // default is redis;
```

- Subscribe:

```javascript
services.on('foo', function(msg) {
  console.log('Received a message: ' + msg);
});
```

- Publish:

```javascript
services.emit('foo', 'Hello World!');
```

- Unsubscribe:

```javascript
services.unsubscribe('foo');
```

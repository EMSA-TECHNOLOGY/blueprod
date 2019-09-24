const config = require('./config');
const natsImpl = require('@blueprod/pubsub-nats');
const redisImpl = require('@blueprod/pubsub-redis');

const constants = {
  /* To add constants here */
  REDIS: 'redis',
  NATS: 'nats',
};

const PubsubService = function (service) {
  service = service || config.name;

  switch (service) {
    case constants.REDIS:
      return redisImpl.getInstance();
    case constants.NATS:
      return natsImpl.getInstance();
    default:
      break;
  }
};

module.exports = new PubsubService();

const config = require('./config');
const natsImpl = require('@blueprod/pubsub-nats');
const redisImpl = require('@blueprod/pubsub-redis');
const kafkaImpl = require("@blueprod/pubsub-kafka");

const constants = {
  /* To add constants here */
  REDIS: 'redis',
  NATS: 'nats',
  KAFKA: 'kafka'
};

const PubsubService = function (service) {
  service = service || config.name;

  switch (service) {
    case constants.REDIS:
      return redisImpl.getInstance();
    case constants.NATS:
      return natsImpl.getInstance();
    case constants.KAFKA:
      return kafkaImpl.getInstance();
    default:
      break;
  }
};

module.exports = PubsubService;

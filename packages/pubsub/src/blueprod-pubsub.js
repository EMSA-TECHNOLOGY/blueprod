'use strict';

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

const PubsubService = function (opts) {
  const service = opts.name || config.name;

  switch (service) {
    case constants.REDIS:
      return redisImpl(opts);
    case constants.NATS:
      return natsImpl(opts);
    case constants.KAFKA:
      return kafkaImpl(opts);
    default:
      break;
  }
};

module.exports = PubsubService;

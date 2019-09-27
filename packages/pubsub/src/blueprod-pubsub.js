/*#*
***************************************************************************************************
** EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** File: blueprod-pubsub.js
** Version: 0.1
** License: MIT
**
** Description:
***************
**
** History:
***********
** Version 0.1 khanhnq/locnt
** + Creation and implementation.
***************************************************************************************************
*#*/

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

const PubsubService = function (opts, service) {
  service = service || config.name;

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

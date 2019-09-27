/*#*
***************************************************************************************************
** EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** File: pubsub-redis.js
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

'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const process = require('process');
const pubsubModules = require("redis");

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const COMPONENT_NAME = 'PubsubRedisEventService';

const constants = {
  /* To add constants here */
};

const DEFAULT_REDIS_CONNECTION = Object.freeze({
  host: "127.0.0.1",
  port: 6379,
  password: null
});

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

const PubsubRedisEventService = function (opts = {}) {
  const self = this;
  self.serviceName = COMPONENT_NAME;

  self.topicListeners = {};

  self.subscriber = self.publisher = pubsubModules.createClient(opts);
  self.subscriber.on("message", function (channel, message) {
    const listener = self.topicListeners[channel];

    listener(message);
  });
};

PubsubRedisEventService.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = function (opts = {}) {
  let connection = {
    host: opts.host || process.env.REDIS_HOST || DEFAULT_REDIS_CONNECTION.host,
    port: opts.port || process.env.REDIS_PORT || DEFAULT_REDIS_CONNECTION.port
  };

  if (opts.password) {
    connection.password = opts.password
  }

  return new PubsubRedisEventService(connection);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 *
 * @param topic
 * @param listener
 * @return {boolean}
 */
PubsubRedisEventService.prototype.on = function (topic, listener) {
  const self = this;

  if (self.topicListeners[topic]) {
    self.unsubscribe(topic);
  }

  self.subscriber.subscribe(topic);
  self.topicListeners[topic] = listener;
};

PubsubRedisEventService.prototype.emit = function (topic, eventData) {
  const self = this;
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };

  self.publisher.publish(topic, JSON.stringify(event));
};

PubsubRedisEventService.prototype.unsubscribe = function (topic) {
  const self = this;
  self.subscriber.unsubscribe(topic);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘


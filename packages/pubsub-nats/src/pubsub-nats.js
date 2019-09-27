/*#*
***************************************************************************************************
** EMSA TECHNOLOGY COMPANY LTD - All Rights Reserved.
**
** File: pubsub-nats.js
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
const pubsubModules = require("nats");

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const COMPONENT_NAME = 'PubSubNatsEventService';

const constants = {
  /* To add constants here */
};

const DEFAULT_NATS_CONNECTION = Object.freeze({
  host: "127.0.0.1",
  port: 4222,
  username: null,
  password: null
});

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

const PubSubNatsEventService = function (opts = {}) {
  const self = this;
  self.serviceName = COMPONENT_NAME;

  self.topics = {};

  self.subscriber = self.publisher = pubsubModules.connect(opts);
};

PubSubNatsEventService.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = function (opts = {}) {
  let natsHost= opts.host || process.env.NATS_HOST || DEFAULT_NATS_CONNECTION.host;
  let natsPort= opts.port || process.env.NATS_PORT || DEFAULT_NATS_CONNECTION.port;

  let connection = {
    url: `nats://${natsHost}:${natsPort}`,
    user: opts.username || DEFAULT_NATS_CONNECTION.username,
    pass: opts.password || DEFAULT_NATS_CONNECTION.password
  };

  return new PubSubNatsEventService(connection);
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
PubSubNatsEventService.prototype.on = function (topic, listener) {
  const self = this;
  let unsubscribe;

  if (self.topics[topic]) {
    self.unsubscribe(topic);
  }

  unsubscribe = self.subscriber.subscribe(topic, listener);
  self.topics[topic] = unsubscribe;
};

PubSubNatsEventService.prototype.emit = function (topic, eventData) {
  const self = this;
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };
  self.publisher.publish(topic, JSON.stringify(event));
};

PubSubNatsEventService.prototype.unsubscribe = function (topic) {
  const self = this;
  let unsubscribe = self.topics[topic];

  if (unsubscribe) {
    self.subscriber.unsubscribe(unsubscribe);
  }
};


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘


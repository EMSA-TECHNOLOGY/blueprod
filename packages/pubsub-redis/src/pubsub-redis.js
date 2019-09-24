'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const process = require('process');
const pubsubModules = require("redis");

let pubsubService = null;

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

const default_authObject = {
  host: "127.0.0.1",
  port: 6379,
  password: null
};

let subscriber;
let publisher;
// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

const PubsubRedisEventService = function () {
  this.serviceName = COMPONENT_NAME;
};

PubsubRedisEventService.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = new PubsubRedisEventService();

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

PubsubRedisEventService.prototype.getInstance = function () {
  const self = this;
  if (!self || pubsubService === null) {
    return new PubsubRedisEventService();
  }

  return self;
};

PubsubRedisEventService.prototype.createConnection = function createConnection(authObject = {}) {
  const self = this;
  self.topicListeners = {};
  let authObj = Object.assign({}, default_authObject, authObject);

  authObj = {
    host: authObj.host,
    port: authObj.port,
  };
  if(authObject.password) {
    authObj.password = authObject.password
  }

  subscriber = publisher = pubsubModules.createClient(authObj);
  subscriber.on("message", function (channel, message) {
    const listener = self.topicListeners[channel];

    listener(message);
  });
};

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

  subscriber.subscribe(topic);
  self.topicListeners[topic] = listener;
};

PubsubRedisEventService.prototype.emit = function (topic, eventData) {
  // const self = this;
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };

  publisher.publish(topic, JSON.stringify(event));
};

PubsubRedisEventService.prototype.unsubscribe = function (topic) {
  subscriber.unsubscribe(topic);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘


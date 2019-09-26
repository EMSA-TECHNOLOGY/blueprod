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

const default_authObject = {
  host: "127.0.0.1",
  port: 4222,
  username: null,
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

const PubSubNatsEventService = function () {
  this.serviceName = COMPONENT_NAME;
};

PubSubNatsEventService.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = new PubSubNatsEventService();

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

PubSubNatsEventService.prototype.getInstance = function () {
  const self = this;
  if (!self) {
    return new PubSubNatsEventService();
  }

  return self;
};

PubSubNatsEventService.prototype.createConnection = function createConnection(authObject = {}) {
  const self = this;
  self.topics = {};
  let authObj = Object.assign({}, default_authObject, authObject);

  authObj = {
    'url': `nats://${authObj.host}:${authObj.port}`,
    'user': authObj.username,
    'pass': authObj.password
  };

  subscriber = publisher = pubsubModules.connect(authObj);
};

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

  unsubscribe = subscriber.subscribe(topic, listener);
  self.topics[topic] = unsubscribe;
};

PubSubNatsEventService.prototype.emit = function (topic, eventData) {
  // const self = this;
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };
  publisher.publish(topic, JSON.stringify(event));
};

PubSubNatsEventService.prototype.unsubscribe = function (topic) {
  const self = this;
  let unsubscribe = self.topics[topic];

  if (unsubscribe) {
    subscriber.unsubscribe(unsubscribe);
  }
};


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘


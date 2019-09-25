'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const process = require('process');
const pubsubModules = require("kafka-node");

let client = null;
let pubsubService = null;
let sid;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const COMPONENT_NAME = 'PubSubKafkaEventService';

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

const PubSubKafkaEventService = function () {
  this.serviceName = COMPONENT_NAME;
};

PubSubKafkaEventService.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = new PubSubKafkaEventService();

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

PubSubKafkaEventService.prototype.getInstance = function () {
  const self = this;
  if (!self || pubsubService === null) {
    return new PubSubKafkaEventService();
  }

  return self;
};

PubSubKafkaEventService.prototype.createConnection = function createConnection(authObject = {}) {
  const self = this;
  client = new pubsubModules.KafkaClient();

  publisher = new pubsubModules.Producer(client);
  self.topicListeners = {};
  self.isPublishReady = false;

  publisher.on('ready', function () {
    self.isPublishReady = true;
  });
};

/**
 *
 * @param topic
 * @param listener
 * @return {boolean}
 */
PubSubKafkaEventService.prototype.on = function (topic, listener) {
  const self = this;

  if (!subscriber) {
    subscriber = new pubsubModules.Consumer(client, [], {autoCommit: true});
    subscriber.on('message', function (message) {
      const listener = self.topicListeners[message.topic];

      listener(message);
    });
  }

  subscriber.addTopics([topic], function (err, added) {
  });

  self.topicListeners[topic] = listener;
};

PubSubKafkaEventService.prototype.emit = function (topic, eventData) {
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };

  let payloads = [
    {topic: topic, messages: [JSON.stringify(event)]}
  ];

  publisher.send(payloads, function (err, data) {
    // console.log(data);
  });
};

PubSubKafkaEventService.prototype.unsubscribe = function (topic) {
  const self = this;

  subscriber.removeTopics([topic], function (err, removed) {
    console.log(`Removed ${topic}!!!!!!`)
  });
};


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘


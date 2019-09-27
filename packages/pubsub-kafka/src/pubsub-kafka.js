'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const process = require('process');
const pubsubModules = require("kafka-node");

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

const DEFAULT_KAFKA_CONNECTION = Object.freeze({
  host: "127.0.0.1",
  port: 9092,
  username: null,
  password: null
});

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

const PubSubKafkaEventService = function (opts = {}) {
  const self = this;
  self.serviceName = COMPONENT_NAME;

  let client = new pubsubModules.KafkaClient(opts);

  self.publisher = new pubsubModules.Producer(client);
  self.subscriber = new pubsubModules.Consumer(client, [], {autoCommit: true});

  self.topicListeners = {};
  self.isPublishReady = false;

  self.publisher.on('ready', function () {
    self.isPublishReady = true;
  });

  self.publisher.on('error', (err) => {
    console.log(`Publisher Error: ${err}`);
  });

  self.subscriber.on('message', function (message) {
    const listener = self.topicListeners[message.topic];

    if (listener) {
      listener(message.value);
    }
  });
  self.subscriber.on('error', (err) => {
    console.log(`Subscriber Error: ${err}`);
  });
};

PubSubKafkaEventService.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = function (opts = {}) {
  let kafkaHost = opts.host || process.env.KAFKA_HOST || DEFAULT_KAFKA_CONNECTION.host;
  let kafkaPort = opts.port || process.env.KAFKA_PORT || DEFAULT_KAFKA_CONNECTION.port;

  let connection = {
    kafkaHost: `${kafkaHost}:${kafkaPort}`
  };

  return new PubSubKafkaEventService(connection);
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
PubSubKafkaEventService.prototype.on = function (topic, listener) {
  const self = this;
  self.subscriber.addTopics([topic], function (err, added) {
    if (err) {
      console.log("Add Topic Error:  " + err);
    }
  });
  self.topicListeners[topic] = listener;
};

PubSubKafkaEventService.prototype.emit = function (topic, eventData) {
  const self = this;
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };

  let payloads = [
    {topic: topic, messages: [JSON.stringify(event)]}
  ];

  self.publisher.send(payloads, function (err, data) {
    if (err) {
      console.log("Send Data Error:  " + err);
    }
  });
};

PubSubKafkaEventService.prototype.unsubscribe = function (topic) {
  const self = this;

  self.subscriber.removeTopics([topic], function (err, removed) {
    if (err) {
      console.log("Unsubscribe Topic Error:  " + err);
    }
  });
};


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘


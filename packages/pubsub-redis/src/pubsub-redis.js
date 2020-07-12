'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const redisClient = require("redis");
const logger = require('@blueprod/logger')('pubsub-redis');

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const DEFAULT_REDIS_CONNECTION = Object.freeze({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PWD || null
});

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

const PubSubRedis = function (opts = {}) {
  this.topicListeners = {};
  opts.no_ready_check = true;
  this.subscriber = this.publisher = redisClient.createClient(opts);
  this.subscriber.on('message', (channel, message) => {
    const listener = this.topicListeners[channel];
    listener(message);
  });

  if (opts.password) {
    this.subscriber.auth(opts.password, () => {
      logger.info('Subscribe connected and authenticated!');
    });
    this.publisher.auth(opts.password, () => {
      logger.info('Publisher connected and authenticated!');
    });
  }
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// │  CLASS DECLARATION --                                                     │
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// │ EXPORT ++                                                                 │
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = function (opts = {}) {
  const redisOpts = {
    host: opts.host || process.env.REDIS_HOST || DEFAULT_REDIS_CONNECTION.host,
    port: opts.port || process.env.REDIS_PORT || DEFAULT_REDIS_CONNECTION.port,
    password: opts.password || process.env.REDIS_PASSWORD,
  };

  return new PubSubRedis(redisOpts);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// │ EXPORT --                                                                 │
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// │ IMPLEMENTATION ++                                                         │
// └───────────────────────────────────────────────────────────────────────────┘

/**
 *
 * @param topic
 * @param listener
 * @return {boolean}
 */
PubSubRedis.prototype.on = function (topic, listener) {
  if (this.topicListeners[topic]) {
    this.unsubscribe(topic);
  }

  this.subscriber.subscribe(topic);
  this.topicListeners[topic] = listener;
};

PubSubRedis.prototype.emit = function (topic, eventData) {
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };

  this.publisher.publish(topic, JSON.stringify(event));
};

PubSubRedis.prototype.unsubscribe = function (topic) {
  this.subscriber.unsubscribe(topic);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

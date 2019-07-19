// Simply wrapping node event emitter.

const events = require('events');
const eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(1000);

const EventManager = function () {};

module.exports = new EventManager();

/**
 * Listen an event.
 *
 * @param eventName
 * @param cb
 */
EventManager.prototype.on = function (eventName, cb) {
  eventEmitter.on(eventName, cb);
  return this;
};

/**
 * Emit an event.
 *
 * @param eventName
 * @param eventData
 */
EventManager.prototype.emit = function (eventName, ...eventData) {
  eventEmitter.emit(eventName, ...eventData);
  return this;
};

/**
 * Unregister an event.
 *
 * @param eventName
 * @param cb
 */
EventManager.prototype.removeListener = function (eventName, cb) {
  eventEmitter.removeListener(eventName, cb);
  return this;
};
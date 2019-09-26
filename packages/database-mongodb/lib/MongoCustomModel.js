
'use strict';

const debug = require("debug");

module.exports = class MongoCustomModel {

  constructor(name, model, mongoose) {
    debug('custom mongo model created!');
    this.mongoose = mongoose;
    this.model = model;
  }

  /* ---------------- IMPLEMENTATION ---------------- */

  /**
   * Create new -> throw error if existed
   * @param object
   * @param opts
   * @returns {Object}
   */
  async dbCreateItem(object, opts) {
    return await this.mongoose.create(object);
  }

  /**
   * Create new -> throw error if existed
   * @param array
   * @param opts
   * @returns {Object}
   */
  async dbCreateItems(array, opts) {
    return await this.dbCreateItem(array);
  }

  /**
   * dbUpdateOrCreateItem
   * Update or create a single item
   * @param key
   * @param object
   * @param opts
   * @returns {*}
   */
  async dbUpdateOrCreateItem(key, object, opts) {
    return await this.mongoose.update(key, object, {upsert: true, setDefaultsOnInsert: true});
  }

  /**
   * dbUpdateItem
   * Update existed item
   * @param key
   * @param object
   * @param opts
   * @returns {*}
   */
  async dbUpdateItem(key, object, opts) {
    return await this.mongoose.updateOne(key, object);
  }

  /**
   * dbUpdateItems
   * Update existed items
   * Return number of updated items by default
   * @param key
   * @param object
   * @param opts
   * @returns {*}
   */
  async dbUpdateItems(key, object, opts) {
    const objectReturned = await this.mongoose.updateMany(key, object);

    return this.toPlainObject(objectReturned);
  }

  /**
   * dbGetItem
   * Get a single item
   * @param key
   * @returns {Query|*}
   */
  async dbGetItem(key) {
    return await this.mongoose.find(key);
  }

  /**
   * Get multiple items
   * Return empty array if nothing found
   * @param filter
   * @returns {Promise<void>}
   */
  async dbGetItems(filter) {
    return await this.mongoose.find(filter);
  }

  /**
   * dbDeleteItem
   * Delete a single item
   * @param key
   * @returns {*}
   */
  async dbDeleteItem(key) {
    return await this.mongoose.remove(key);
  }

  /**
   *
   * @param filter
   * @returns {Promise<*>}
   */
  async dbDeleteItems(filter) {
    return await this.mongoose.remove(filter);
  }

};


'use strict';
const AWS = require('aws-sdk');
var debug = require('debug');
debug.enabled = true;

module.exports = class DynamoCustomModel {
  constructor(name, model, dynamodb) {
    this.tableName = model.TableName = model.TableName = name;
    this.docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb });

    dynamodb.listTables({}, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        if (data && data.TableNames && data.TableNames.length !== 0) {
          if(data.TableNames.indexOf(name) === -1) {
            dynamodb.createTable(model, (err, data) => {
              if (err) {
                console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
              } else {
                debug('Created table. Table description JSON:', JSON.stringify(data, null, 2));
              }
            });
          }
        }
      }
    });
  }

  /* ---------------- IMPLEMENTATION ---------------- */

  /**
   * Create new -> throw error if existed
   * @param object
   * @param opts
   * @returns {Object}
   */
  async dbCreateItem(object, opts) {

    let dataCreated;
    const isKeyExisted = await this._isExist(object);
    if(isKeyExisted) {
      console.error('Object is existed');
      throw 'Object is existed';
    }

    try {
      dataCreated = await this._putItem(object);
      debug('Create data succeeded. Table: ' + this.tableName);
    } catch (err) {
      debug('Create data error', JSON.stringify(err, null, 2));
      throw err;
    }

    return dataCreated;
  }

  /**
   * Create new -> throw error if existed
   * DynamoDb is not supported multiple records
   * @param array
   * @param opts
   * @returns {Object}
   */
  async dbCreateItems(array, opts) {
    // TODO TBD
    return Promise.reject("TBD");
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
    let dataCreated;

    try {
      dataCreated = await this._putItem(object);
      debug('UpdateOrCreate data succeeded. Table: ' + this.tableName);
    } catch (err) {
      debug('UpdateOrCreate data error', JSON.stringify(err, null, 2));
      throw err;
    }

    return dataCreated;
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
    let dataCreated;

    try {
      dataCreated = await this._putItem(object);
      debug('Update data succeeded. Table: ' + this.tableName);
    } catch (err) {
      debug('Update data error', JSON.stringify(err, null, 2));
      throw err;
    }

    return dataCreated;
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
    // TODO TBD
    return Promise.reject("TBD");
  }

  /**
   * dbGetItem
   * Get a single item
   * @param key
   * @returns {Query|*}
   */
  async dbGetItem(key) {
    let objects;

    try {
      objects = await this._get(key);
      debug('Update data succeeded. Table: ' + this.tableName);
    } catch (err) {
      debug('Update data error', JSON.stringify(err, null, 2));
      throw err;
    }

    return objects;
  }

  /**
   * dbDeleteItem
   * Delete a single item
   * @param key
   * @returns {*}
   */
  async dbDeleteItem(key) {

    let objects;
    const isKeyExisted = await this._isExist(key);
    if(!isKeyExisted) {
      debug('Object is not existed!');
      throw 'Object is not existed!';
    }

    try {
      objects = await this._delete(key);
      debug('Delete data succeeded. Object: ' + objects);
    } catch (err) {
      debug('Delete data error', JSON.stringify(err, null, 2));
      throw err;
    }

    return objects;
  }

  /**
   * dbDeleteItems
   * Delete a multiple items
   * @param filter
   * @returns {*}
   */
  async dbDeleteItems(filter) {

    return Promise.reject("TBD");
  }


  /* ----------- INTERNAL_IMPLEMENTATION ------------------- */

  /**
   * Check if key is existed
   * @param key
   * @returns {Promise<boolean>}
   */
  async _isExist(key) {
    const params = {
      TableName: this.tableName,
      Key: key
    };

    let exists = false;
    let result = await this.docClient.get(params).promise();
    if (result.Item !== undefined && result.Item !== null) {
      exists = true;
    }

    return exists;
  }

  async _putItem(object) {
    const params = {
      TableName: this.tableName,
      Item: object,
    };
    return await this.docClient.put(params).promise();
  }

  async _get(key) {
    var params = {
      TableName: this.tableName,
      Key: key
    };

    return await this.docClient.get(params).promise();
  }

  async _delete(key) {
    var params = {
      TableName: this.tableName,
      Key: key
    };

    return await this.docClient.delete(params).promise();
  }
};

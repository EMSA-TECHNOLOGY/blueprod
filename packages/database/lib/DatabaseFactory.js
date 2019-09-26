'use strict';

const debug = require('debug')('database');
debug.enabled = true;

const Adapters = new Map();
const DatabaseModels = new Map();
const DataSources = new Map();

module.exports = class DatabaseFactory {
  static createConnection(dataSourceName, adapter, connString, options) {
    if (DataSources.has(dataSourceName)) {
      debug('Ignored duplicated data source: ' + dataSourceName);

      return DataSources.get(dataSourceName);
    }

    const database = DatabaseFactory.findDatabaseAdapter(adapter);
    const newDataSource = new database(connString, options, dataSourceName);

    debug('Connected to a ' + adapter + ' database: ' + dataSourceName);
    DataSources.set(dataSourceName, newDataSource);

    return newDataSource;
  }

  static createModel(name, schema, dataSourceName) {
    /* Check if model duplicated */
    if (DatabaseModels.has(name)) {
      debug('Ignore duplicated model: ' + name);
      return DatabaseFactory.getModel(name);
    }

    /* Check if unknown dataSource */
    if (!dataSourceName || !DataSources.has(dataSourceName)) {
      throw new Error('Unknown data source: ' + dataSourceName);
    }

    const dataSource = DataSources.get(dataSourceName);
    const model = dataSource.createModel(name, schema);

    DatabaseModels.set(name, model);

    return model;
  }

  static getModel(name) {
    if (DatabaseModels.has(name)) {
      return DatabaseModels.get(name);
    } else {
      throw new Error('Unknown model: ' + name);
    }
  }

  static getModels() {
    return DatabaseModels;
  }

  static registerAdapter(name, adapter) {
    if (Adapters.has(name)) {
      debug('Duplicate registered adapter: ' + name + '. The older adapter will be override.');
    }

    Adapters.set(name, adapter);
  }

  static findDatabaseAdapter(adapter) {
    if (Adapters.has(adapter)) {
      return Adapters.get(adapter);
    } else {
      throw new Error('Unknown database adapter: ' + adapter);
    }
  }
};

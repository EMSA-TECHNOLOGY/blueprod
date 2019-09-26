'use strict';

const {createConnection} = require('mongoose');
const MongoCustomModel = require("./MongoCustomModel");

class MongoDatabaseService {
  constructor(connString, options, dataSourceName) {
    this.createConnection(connString, options);
    this.dataSourceName = dataSourceName;
  }

  createConnection(connString, options) {
    this.connection = createConnection(connString, options);
  }

  createModel(name, model) {
    // TODO
    // return this.connection.model(name, model);
    return new MongoCustomModel(this.dataSourceName + '_' + name, model, this.connection.model(name, model));
  }
}

module.exports = MongoDatabaseService;

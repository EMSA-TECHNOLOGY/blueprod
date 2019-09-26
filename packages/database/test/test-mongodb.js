'use strict';

/* Simulate bootstrap */
const databaseFactory = require('../lib/DatabaseFactory');
const MongoDbService = require('../../database-mongodb/lib/MongoDatabaseService');

const debug = require('debug')('http');
debug.enabled = true;

const ADAPTER_MONGO = 'mongodb';

databaseFactory.registerAdapter(ADAPTER_MONGO, MongoDbService);

/* Initialize database */
const dataSources = {
  m_1_test: {
    adapter: ADAPTER_MONGO,
    url: 'mongodb://localhost:27017/m_1_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  }
};

for (let db in dataSources) {
  const dsOptions = dataSources[db];

  databaseFactory.createConnection(db, dsOptions.adapter, dsOptions.url, dsOptions.options);
}

/* Initialize models */
const mongoose = require('mongoose');
const models = [
  {
    dataSource: 'm_1_test',
    name: 'product',
    schema: new mongoose.Schema({
      name: { type: String, required: true, unique: true},
    }),
    data: [
      {name: 'product5'},
      {name: 'product6'},
    ],
  }
];

for (let model of models) {
  const dbModel = databaseFactory.createModel(model.name, model.schema, model.dataSource);

  // TODO test dbCreateItem
  // testCreateItem(dbModel, model.data[0]);

  // TODO test dbCreateItems
  // testCreateItems(dbModel, model.data);

  // TODO test get item
  // testGetItem(dbModel, model.data[0]);

  // TODO test delete item
  // testDeleteItem(dbModel, model.data[0]);

  // // TODO test delete items
  // var data = {name: 'product5'};
  // testDeleteItems(dbModel, data);
}

async function testCreateItem(dbModel, object) {
  let item;
  try {
    item = await dbModel.dbCreateItem(object);
    debug(JSON.stringify(item));
  } catch (err) {
    debug(err)
  }
}

async function testCreateItems(dbModel, array) {
  let item;
  try {
    item = await dbModel.dbCreateItems(array);
    debug(JSON.stringify(item));
  } catch (err) {
    debug(err)
  }
}

async function testGetItem(dbModel, key) {
  let item;
  try {
    item = await dbModel.dbGetItem(key);
    debug(JSON.stringify(item));
  } catch (err) {
    debug(err)
  }
}

async function testDeleteItem(dbModel, key) {
  let item;
  try {
    item = await dbModel.dbDeleteItem(key);
    debug(JSON.stringify(item));
  } catch (err) {
    debug(err)
  }
}

async function testDeleteItems(dbModel, filter) {
  let item;
  try {
    item = await dbModel.dbDeleteItems(filter);
    debug(JSON.stringify(item));
  } catch (err) {
    debug(err)
  }
}

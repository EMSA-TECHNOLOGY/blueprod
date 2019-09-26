'use strict';

/* Simulate bootstrap */
const databaseFactory = require('../lib/DatabaseFactory');
const DynamoDbService = require('../../database-dynamodb/lib/DynamoDatabaseService');

var debug = require('debug')('http');
debug.enabled = true;

const ADAPTER_DYNAMO = 'dynamodb';

process.env.AWS_DYNAMO_ENDPOINT = 'https://dynamodb.ap-southeast-1.amazonaws.com';
process.env.AWS_DYNAMO_ACCESS_KEY_ID = '';
process.env.AWS_DYNAMO_SECRET_ACCESS_KEY = '';
process.env.AWS_DYNAMO_REGION = 'ap-southeast-1';

databaseFactory.registerAdapter(ADAPTER_DYNAMO, DynamoDbService);

/* Initialize database */
const dataSources = {
  "dynamodb_emsa_vinhpx": {
    adapter: ADAPTER_DYNAMO,
    options: {
      apiVersion: '2012-08-10',
    },
  },
};

for (let db in dataSources) {
  const dsOptions = dataSources[db];

  databaseFactory.createConnection(db, dsOptions.adapter, dsOptions.url, dsOptions.options);
}

/* Initialize models */
const models = [
  {
    dataSource: 'dynamodb_emsa_vinhpx',
    name: 'log',
    schema: {
      AttributeDefinitions: [
        {
          AttributeName: "Message",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "Message",
          KeyType: "HASH"
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      // TableName: "log"
    },
    data: [
      {Message: 'Error 1'},
      {Message: 'Error 2'},
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

  // TODO test delete items
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

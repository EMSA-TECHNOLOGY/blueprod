'use strict';

const AWS = require('aws-sdk');
const DynamoCustomModel = require('./DynamoCustomModel');


class DynamoDatabaseService {
  constructor(connString, options, dataSourceName) {
    this.createConnection(options);
    this.dataSourceName = dataSourceName;
  }

  createConnection(options = {}) {
    options.apiVersion = options.apiVersion || '2012-08-10';
    options.endpoint = options.endpoint || process.env.AWS_DYNAMO_ENDPOINT;
    options.accessKeyId = options.accessKeyId || process.env.AWS_DYNAMO_ACCESS_KEY_ID;
    options.secretAccessKey = options.secretAccessKey || process.env.AWS_DYNAMO_SECRET_ACCESS_KEY;
    options.region = options.region || process.env.AWS_DYNAMO_REGION;
    this.connection = this.dynamodb = new AWS.DynamoDB(options);
  }

  createModel(name, model) {
    return new DynamoCustomModel(this.dataSourceName + '_' + name, model, this.dynamodb);
  }

}

module.exports = DynamoDatabaseService;

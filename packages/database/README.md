# Database provider

## **Availability:**
* Create multiple **data source** to different types of database (mongo, dymano, ...)
* Create **models** belong to a **data source**.
* Each **model** (no matter what **data source**, what database type) will have a same behavior like **mongoose model**. _**mongoose model is used as the standard**_

## **How to use:**
1. Create data source: invoke: `databaseFactory.createConnection(dataSourceName, adapter, connString, options)`

Parameters:
* dataSourceName `string`: The data name of data source (unique). e.g: xpaas_db, log_db 
* adapter `string`: The database adapter. Which is implemented and registered in DatabaseFactory. e.g: mongodb, dynamodb
* connString `string`: The connection string (some database does not need like dynamodb). e.g: mongodb://localhost:27017/log_db
* options `object`: The connection options, used to initialize the connection

Return: created Datasource

2. Create Model: invoke: `databaseFactory.createModel(name, schema, dataSourceName)`

Parameters:
* name `string`: The model name (unique). e.g: User, Company 
* schema `object`: Model schema. Depend on what database type is used for this model. 
* dataSourceName `string`: Name of data source be used to initialize this model

Return: Created Model

3. Get Model: Invoke `databaseFactory.getModel(name)`

  Parameters:
  * name `string`: The model name. e.g: User, Company
  
4. Model behavior: 
- dbCreateItem (object, opts) -> create new -> throw error if existed
- dbCreateItems (object, opts) -> create new -> throw error if existed
- dbUpdateOrCreateItem (key, object, opts) -> update or create a single item
- dbUpdateItem (key, object, opts) -> update existed item -> throw error if not existed
- dbUpdateItems (key, object, opts) -> update existed items -> return number of updated items by default
- dbGetItem (key)-> get a single item -> throw error if not existed
- dbGetItems (filter) -> get multiple items -> return empty array if nothing found
- dbDeleteItem ( key ) -> delete a single item
- dbDeleteItems (filter) -> delete multiple items

## Test
Enter Dynamo Secret information to AWS_DYNAMO_ACCESS_KEY_ID and AWS_DYNAMO_SECRET_ACCESS_KEY

`npm install aws-sdk mongoose`

`./packages/database/test/test-mongodb.js.js`
`./packages/database/test/test-dynamodb.js.js`

const END_VARS = require('./end-vars').SERVER_ENV_VARS;
const IMPLEMENTATIONS = require('./pubsub-types').PUBSUB_TYPE;

let testConst = {};

/* REDIS */
testConst[IMPLEMENTATIONS.REDIS] = {};
testConst[IMPLEMENTATIONS.REDIS].name = IMPLEMENTATIONS.REDIS;
testConst[IMPLEMENTATIONS.REDIS].host = END_VARS.REDIS_HOST;
testConst[IMPLEMENTATIONS.REDIS].port = END_VARS.REDIS_PORT;
/* NATS */
testConst[IMPLEMENTATIONS.NATS] = {};
testConst[IMPLEMENTATIONS.NATS].name = IMPLEMENTATIONS.NATS;
testConst[IMPLEMENTATIONS.NATS].host = END_VARS.NATS_HOST;
testConst[IMPLEMENTATIONS.NATS].port = END_VARS.NATS_PORT;
/* KAFKA */
testConst[IMPLEMENTATIONS.KAFKA] = {};
testConst[IMPLEMENTATIONS.KAFKA].name = IMPLEMENTATIONS.KAFKA;
testConst[IMPLEMENTATIONS.KAFKA].host = END_VARS.KAFKA_HOST;
testConst[IMPLEMENTATIONS.KAFKA].port = END_VARS.KAFKA_PORT;
/* -- Other -- */

/* Switch module here -----------> */
/* .REDIS/.NATS/.... */
const testImplName = IMPLEMENTATIONS.NATS;

module.exports.TEST_SERVER = {
  NAME: testConst[testImplName].name,
  HOST: testConst[testImplName].host,
  PORT: testConst[testImplName].port,
};

const serverConst = require('../constant/serverConst');
const moduleConst = require('../constant/moduleConst');

let testConst = {};

/* REDIS */
testConst[moduleConst.REDIS] = {};
testConst[moduleConst.REDIS].name = moduleConst.REDIS;
testConst[moduleConst.REDIS].host = serverConst.REDIS_HOST;
testConst[moduleConst.REDIS].port = serverConst.REDIS_PORT;
/* NATS */
testConst[moduleConst.NATS] = {};
testConst[moduleConst.NATS].name = moduleConst.NATS;
testConst[moduleConst.NATS].host = serverConst.NATS_HOST;
testConst[moduleConst.NATS].port = serverConst.NATS_PORT;
/* -- Other -- */

/* Switch module here -----------> */
/* .REDIS/.NATS/.... */
const currentModule = moduleConst.NATS;

module.exports = {
  NAME: testConst[currentModule].name,
  HOST: testConst[currentModule].host,
  PORT: testConst[currentModule].port,
};

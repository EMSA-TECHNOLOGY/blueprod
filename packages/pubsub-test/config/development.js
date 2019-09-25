const serverConst = require('../constant/serverConst');

module.exports = {
  REDIS_HOST: process.env[serverConst.REDIS_HOST] || '127.0.0.1',
  REDIS_PORT: 6379,
  NATS_HOST: process.env[serverConst.NATS_HOST] || '127.0.0.1',
  NATS_PORT: 4222,
  KAFKA_HOST: process.env[serverConst.KAFKA_HOST] || '127.0.0.1',
  KAFKA_PORT: 9092
};

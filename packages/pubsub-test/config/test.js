module.exports = {
  REDIS_HOST: process.env['REDIS_HOST'] || '127.0.0.1',
  REDIS_PORT: 6379,
  NATS_HOST: process.env['NATS_HOST'] || '127.0.0.1',
  NATS_PORT: 4222,
  KAFKA_HOST: process.env['KAFKA_HOST'] || '127.0.0.1',
  KAFKA_PORT: 9092
};

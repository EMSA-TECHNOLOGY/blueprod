const logger = require('../src/Logger')();

const obj1 = {
  a: 1,
  b: 'message 1'
};

logger.info(`info message`);
logger.warn(`warn message`);
logger.debug(`debug message`);
logger.error(`error message`);
logger.error(`error message with ex, `, new Error('dummy error message'));


logger.info(obj1);

for (let i = 0; i < 100; i++) {
  logger.info(`info message ` +i);
  logger.warn(`warn message ` +i);
  logger.debug(`debug message ` +i);
  logger.error(`error message ` +i);
}

// logger.end();
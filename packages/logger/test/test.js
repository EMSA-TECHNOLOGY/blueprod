const options = {
  "console": {
    "enabled": true,
    "level": "debug"
  },
  "file": {
    "enabled": true,
    "level": "debug",
    "logAppend": true,
    /* 5MB */
    "maxsize": 5*1000000,
    "json": true,
    "prettyPrint": true,
    "depth": 10,
    "tailable": true,
    "zippedArchive": true,
    "datePattern": "yyyy-MM-dd"
  },
  "database": {
    /* @see: https://github.com/winstonjs/winston-mongodb */
    "enabled": true,
    /* url: mongodb://localhost:27017/blueprod_log */
    /* Will remove color attributes from the log entry message, defaults to false. */
    "decolorize": true,
    "leaveConnectionOpen": false,
  },
};

//const logger = require('@blueprod/logger')('MyLogger', options);
const logger = require('../src/Logger')('MyLogger', options);

logger.debug('your debug log message!');
logger.info('your info log message!');
logger.warn('your warn log message!');
logger.error('your error log message!');
logger.error('your error log message with exception!', new Error('a dummy error message!'));
logger.error(new Error('a dummy error message!'));

const hook = {
  level : 'error',
  cb : function(hookInfo) {
    console.log(hookInfo);
  }
};

logger.addHook(hook);

logger.error('this error message should be caught by hook!');
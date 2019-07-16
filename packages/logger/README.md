# blueprod Logger

The simple wrapper for Winston logger, just need to import and provide simple configurations under javascript object.

(Note: winston 3.x is used)

Supported transports:
- console
- file
- database (mongodb)
- http (soon)

## How To Use

### Example:

```javascript
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
```

### Add Hook

TODO not working yet.

This will help us to capture the logger activities when there is a 'warning', 'error' logs.

```javascript
const hook = {
  level : 'error',
  cb : function(hookInfo) {/* do something */}
};
logger.addHook(hook);
```

Returned *hookInfo* will contained propertyName *connector*(file, console, mongodb), *level*, *message*, *meta*.

### Multiple Log Instances

You can use Logger with multiple instances, for each component just create a new instance of Logger with the input parameter is component name. For examples:

```javascript
const userLogger = require('@blueprod/logger')({name : 'UserDataService'});
const groupLogger = require('@blueprod/logger')({name : 'GroupDataService'});

userLogger.error("Error message"); // error : [IoTDataService] - Error message
userLogger.warn("Warn message");
userLogger.info("Info message");
userLogger.debug("Debug message");
userLogger.verbose("Verbose message");

groupLogger.error("Error message"); // error : [ThingDataService] - Error message
groupLogger.warn("Warn message");
groupLogger.info("Info message");
groupLogger.debug("Debug message");
groupLogger.verbose("Verbose message");
```

### Debug

Logger is built with support the __DEBUG__ environment variable from [debug](https://github.com/visionmedia/debug) which provides simple conditional logging.

For examples:

todo....

## Roadmap


## 0.1.x

- Basic functionalities as transports (console/file/database)
- Debug
- Hook

## 0.2.x

- http support
- stream support

## 0.3.x

- bucket/s3 support
- Send mail (i.e. on error)

## License

MIT license 

## Author

Developed & maintained by EMSA TECHNOLOGY COMPANY LTD (contact @ emsa-technology dot com).

# blueprod Logger

The simple wrapper for Winston logger, just need to import and provide simple configurations under javascript object.

(Note: winston 3.x is used)

Supported transports:
- console
- file
- database (mongodb)
- http (soon)

## How To Use

**0. Example Configuration**

```yaml
logging:
  file:
    enabled: true
    level: debug
    logAppend: true
    # 5MB
    maxsize: 5242880
    json: true
    prettyPrint: true
    depth: 10
    tailable: true
    zippedArchive: true
    datePattern: yyyy-MM-dd
  database:
    enabled: false
    # Connection information should be configured in database.logdb
  console:
    enabled: true
    level: debug
```

**1. Instantiate/get the logger to your class:**


```javascript
const logger = require('@blueprod/logger')({name : 'UserService'});
```

**2 API:**

```javascript
logger.error("Error message");
logger.warn("Warn message");
logger.info("Info message");
logger.debug("Debug message");
logger.verbose("Verbose message");
```

**3. Add Hook:**

This will help us to capture the logger activities when there is a 'warning', 'error' logs.

```javascript
const hook = {
  level : 'error',
  cb : function(hookInfo) {/* do something */}
};
logger.addHook(hook);
```

Returned *hookInfo* will contained propertyName *connector*(file, console, mongodb), *level*, *message*, *meta*.

**4. Multiple Log instances:**

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

**5. Debug***

Logger is built with support the __DEBUG__ environment variable from [debug](https://github.com/visionmedia/debug) which provides simple conditional logging.

For examples:



## License

MIT license 

## Author

Developed & maintained by EMSA TECHNOLOGY COMPANY LTD (contact @ emsa-technology dot com).

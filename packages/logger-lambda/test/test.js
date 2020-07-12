process.env['MyLogger_DEBUG'] = 'TRUE';

const myLogger = require('../src/Logger')('MyLogger');
const myLoggerSameInstance = require('../src/Logger')('MyLogger');

myLogger.debug('your debug log message!');
myLogger.info('your info log message!');
myLogger.warn('your warn log message!');
myLogger.error('your error log message!');
myLogger.error('your error log message with exception!', new Error('a dummy error message!'));
myLogger.error(new Error('a dummy error message!'));

console.log('' +(myLogger === myLoggerSameInstance));
console.log('MyLogger is debug: ' +(myLogger.isDebug()));

process.env['BD_LOGGER_NAMESPACE'] = 'TRUE';

const loggerWithNameSpace = require('../src/Logger')('NS-TEST');
loggerWithNameSpace.trace('test message');
console.log('loggerWithNameSpace is debug: ' +(loggerWithNameSpace.isDebug()));
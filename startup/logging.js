const winston = require('winston'); // default logger comes with transport for loggin messages in the console. Can also create custom
require('winston-mongodb');
require('express-async-errors');

module.exports = function () {
  winston.handleExceptions(
    // Does the same as both the below functions, but puts the logs all in the same file
    new winston.transports.File({ filename: 'logfile.log' }),
    new winston.transports.Console({ colorize: true, prettyPrint: true }) // outputs errors to console for everyone
  );

  winston.add(winston.transports.File, { filename: 'logfile.log' }); // Another transport that is for logging messages in a file locally in the parent folder.
  winston.add(winston.transports.MongoDB, {
    db: 'mongodb://localhost/vidly',
    level: 'error',
  }); // Another transport for logging in mongoDB. db: 'database connection string'
};

// Catches unhandled promise rejections
/* process.on('unhandledRejection', (ex) => {
  console.log('It went here 2.');
  winston.log(ex.message, ex);
  process.exit(1);
}); */

// process is an event emitter. It can emit events. 'on' is used to listen/subscribe for an event.
// Catches uncaughtExceptions
/* process.on('uncaughtException', (ex) => {
  console.log('We got an uncaught exception!!!!');
  winston.error(ex.message, ex);
  process.exit(1);
}); */

// Test with promise
/* const p = Promise.reject(new Error('Promise failed. Better luck next time!'));
p.then(() => console.log('a sucess'));
 */

const winston = require('winston');

// Catches errors in express' request processing pipline and will ignore anything outside of the context of express
module.exports = function (err, req, res, next) {
  // Log the exception with Winston
  // levels: 1) error, 2) warn, 3) info, 4)verbose, 5)debug, 6)silly.  (If you choose info, then (1), (2) and (3) will be logged)
  winston.error(err.message, err); // pass err.message, and 'err' which can store meta data in it
  res.status(500).send('Something failed');
};

// ! The above won't catch errors at a higher level outside of the express app. Below shows how.
// # 1) Catches uncaught exceptions in synchronous code outside of express. This will not work for promises and async code
// Process is an event emitter. It can emit events. On is used to listen/subscribe for an event.
/* process.on('uncaughtException', (ex) => {
  console.log('We got an uncaught exception!');
  winston.error(ex.message, ex);
}); */

// $ 2) Can use this for promise rejections
/* // Catches unhandled promise rejections
process.on('unhandledRejection', (ex) => {
  winston.error(ex.message, ex);
  process.exit(1);
}); */

// ~ Should terminate the node process with these types of exceptions. Use process managers to restart the node process

// ? winston also has this that will catch uncaughtExceptions and rejected promises
/* winston.handleExceptions( // 
  new winston.transports.File({ filename: 'uncaughtExceptions.log' })
); */

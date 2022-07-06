// Using npm 'express-async-errors' instead of this currently
// Does the same thing basically

module.exports = function asyncMiddleware(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (ex) {
      next(ex); // Uses the app.use(function(err, ..)) in index, since next mw function
    }
  };
};

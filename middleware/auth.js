const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next) {
  // (request, response, nextMiddleWareFunction() = next())
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Acess denied. No token provided');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey')); // verifies if user's token is valid. If valid, decodes it and returns payload, which is the _id and isAdmin that has been decoded
    req.user = decoded; // the users _id and isAdmin will be available as req.user._id...
    next(); // pass control to the next middleware function
  } catch (ex) {
    res.status(400).send('Invalid token');
  }
}

module.exports = auth;

// In computing and telecommunications, the payload is the part of transmitted data that is the actual intended message. Headers and metadata are sent only to enable payload delivery.
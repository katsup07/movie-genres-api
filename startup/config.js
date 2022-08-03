const config = require('config'); // from node modules

module.exports = function () {
  if (!config.get('jwtPrivateKey')) { // jwt = json web token
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined');
  }
};

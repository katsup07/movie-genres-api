const Joi = require('joi');

module.exports = function () {
  Joi.objectId = require('joi-objectid')(Joi); // Checks for valid mongoDB id format
};

const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config'); // node module

module.exports = function () {
  const db = config.get('db')
  mongoose
    .connect(db) // ! cut and added to config/default.json
    .then(winston.info(`Connected to ${db}... `)); // could use console.log('Connected to MongoDB...') too
};

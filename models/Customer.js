const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model(
  'Customer',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    phone: {
      type: String,
      required: true,
      minLength: 7,
      maxLength: 11,
    },
    isGold: {
      type: Boolean,
      default: false,
    },
  })
);

// Validation to check that client sent data in correct form
function validateCustomer(customer) {
  console.log('Trying to validate...');
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string().min(5).max(11).required(),
    isGold: Joi.string(),
  });
  return schema.validate(customer);
}

module.exports = { Customer, validateCustomer };

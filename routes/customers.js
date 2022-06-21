const Joi = require('joi');
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Customer = mongoose.model('Customer', new mongoose.Schema({
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
}));
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

/* Endpoint to get customers */
router.get('/', async (req, res) => { //  /api/customers/
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

/* Endpoint to get a single customer */
router.get('/:id', async (req, res) => { // /api/customers/:id
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('404 Error - Customer not found.');
    res.send(customer);
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

/* Add a customer */
router.post('/', async (req, res) => { // /api/customers/
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.message);
  console.log('Did this part run?');

  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });
  let result;
  try {
    result = await customer.save();
  } catch (err) {
    console.log(err.errors);
  }
  res.send(result);
});

/* TODO - Still need to add validation with Joi to most functions */
/* Update a customer */
router.put('/:id', async (req, res) => { // /api/customers/:id
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold,
    },
    { new: true },
  ).catch((err) => console.log('No such id or something went wrong.', err.message));

  if (!customer) res.status(404).send('404 Error - Resource not found!');
  res.send(customer);
});

/* Delete a customer */
router.delete('/:id', async (req, res) => { // /api/customers/:id
  try {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) return res.status(404).send('Error');
    res.send(customer);
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

module.exports = router;

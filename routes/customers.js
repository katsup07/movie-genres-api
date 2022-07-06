// ~ routes for /api/customers
const express = require('express');
const auth = require('../middleware/auth');
const { Customer, validateCustomer } = require('../models/Customer'); // Customer model(Like a class)

const router = express.Router();

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
    return res.status(400).send(`400 Error Bad Request - Either no such id or something else went wrong. The error message follows: ${err.message}`);
  }
});

/* Add a customer */
router.post('/', auth, async (req, res) => { // /api/customers/
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
router.put('/:id', auth, async (req, res) => { // /api/customers/:id
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
router.delete('/:id', auth, async (req, res) => { // /api/customers/:id
  try {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) return res.status(404).send('Error');
    res.send(customer);
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

module.exports = router;

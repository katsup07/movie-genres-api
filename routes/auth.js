// ! Validating user logins
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { User } = require('../models/User');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the login page!!');
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  // use findOne when looking up by properties
  const user = await User.findOne({ email: req.body.email }).catch((err) =>
    res.send(err)
  );
  if (!user) return res.status(400).send('Invalid email or password');
  // compares plain-text password with hashed-password // compare() will get salt and hash the plain-text password.
  // If equal, will return true.
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password');
  // Make a json webtoken - jwt. Can have 1st arg as string or object, and next as the secret key.
  const token = user.generateAuthToken();
  res.send(token);
});

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(), // checks that it's a valid email
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = router;

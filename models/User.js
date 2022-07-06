const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true, // mongoDB will throw an error here if someone tries to add a user with the same email address
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024, // later will be hashed, so need 1024, eventhough user can only make it 255
  },
  isAdmin: Boolean,
});

// Add methods to userSchema
userSchema.methods.generateAuthToken = function () {
  // adds method onto each user
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin }, // encapsulate the id and isAdmin in the user token.
    config.get('jwtPrivateKey')
  ); //  Store secretKey in env variable. Encodes the id and isAdmin result in token.               //? _id: user._id
  return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(), // checks that it's a valid email
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = { User, validateUser };

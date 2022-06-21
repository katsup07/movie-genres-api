const mongoose = require('mongoose');
const Joi = require('joi');

const Genre = mongoose.model('Genre', new mongoose.Schema({
  name: { // Can check validation with mongoose too
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  date: { type: Date, default: Date.now },
}));

// Used to validate input from client
function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });
  return schema.validate(genre);
}

module.exports = { Genre, validateGenre };
const mongoose = require('mongoose');
const Joi = require('joi');

const genreSchema = new mongoose.Schema({
  name: {
    // Can check validation with mongoose too
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  date: { type: Date, default: Date.now },
});

const Genre = mongoose.model('Genre', genreSchema);

// Used to validate input from client
function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });
  return schema.validate(genre);
}

module.exports = { Genre, genreSchema, validateGenre };

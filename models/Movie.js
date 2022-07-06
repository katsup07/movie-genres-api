const mongoose = require('mongoose');
const Joi = require('joi');
const { genreSchema } = require('./Genre');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  genre: {
    // ! model for how we want it to be in mongoDb
    type: genreSchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
});

const Movie = mongoose.model('Movie', movieSchema);

// ! Used to validate input from client
function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    genreId: Joi.objectId().required(), // client will send 'genreId', not 'genre'
    numberInStock: Joi.number().required(),
    dailyRentalRate: Joi.number().required(),
  });
  return schema.validate(movie);
}

module.exports = { movieSchema, Movie, validateMovie };

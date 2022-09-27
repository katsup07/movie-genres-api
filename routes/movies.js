// ~ routes for /api/movies
const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Movie, validateMovie } = require('../models/Movie');
const { Genre } = require('../models/Genre');

const router = express.Router();

/* Endpoint to get movies */
router.get('/', async (req, res) => {
  // /api/movies
  const movies = await Movie.find().sort('name');
  res.send(movies);
});

/* Endpoint to a single movie */
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('404 Error - movie not found!');
    res.send(movie);
  } catch (err) {
    res
      .status(400)
      .send(`400 Error - Bad request! Error message: ${err.message}`);
  }
});

/* Add a new movie */
router.post('/', auth, async (req, res) => {
  const { error } = validateMovie(req.body);
  console.log(error);
  if (error) return res.status(400).send(error.details[0].message);
  const genre = await Genre.findById(req.body.genreId).catch((err) =>
    res.send(err)
  );

  const movie = new Movie({
    title: req.body.title,
    genre: { _id: genre._id, name: genre.name }, // Mongo sets other properties on genre, so don't want to set 'genre: genre' but instead use only need'genre._id' and 'genre._name' from client
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });

  await movie.save().catch((err) => res.send(err));

  res.send(movie);
});

/* Update */
router.put('/:id', auth, async (req, res) => {
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId).catch((err) =>
    res.send(err)
  );

  if (error) return res.status(400).send('Invalid genre');

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: { _id: genre._id, name: genre.name },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    },

    { new: true }
  ).catch((err) => res.send(err));
  if (!movie) res.status(404).send('404 Error - Resource not found');
  res.send(movie);
});

/* Remove */
router.delete('/:id', [auth, admin], async (req, res) => {
  // eslint-disable-next-line prettier/prettier
  const movie = Movie.findByIdAndRemove(req.params.id)
                     .catch((err) => console.log(err));

  if (!movie) return res.status(404).send('404 Error - resource not found');
  res.send(movie);
});

module.exports = router;

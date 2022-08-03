// ~ routes for /api/genres
const express = require('express');
// const asyncMiddleWare = require('../middleware/async'); // Using npm 'express-async-errors' instead
const { default: mongoose } = require('mongoose');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Genre, validateGenre } = require('../models/Genre');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

/* Endpoint to get genres */
router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.send(genres);
});

/* Endpoint to get a single genre */
router.get('/:id', validateObjectId, async (req, res) => {
  // /api/genres:id
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send('404 Error - Genre not found!');

  res.send(genre);
});

/* Add a genre */
router.post('/', auth, async (req, res) => {
  // auth() is a mw function that is exectuted before the next mw, which is a route handler --> function(req, res)
  const { error } = validateGenre(req.body); // result = { error, value}
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({ name: req.body.name });
  await genre.save();

  res.send(genre);
});

/* Update a genre */
router.put('/:id', auth, async (req, res) => {
  // '/api/genres:id'
  const { error } = validateGenre(req.body); // result = { error, value}
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true } // option to have updated course return. otherwise before updated will return
  ).catch((err) => res.send(err));

  if (!genre) return res.status(404).send('404 Error - Resource not found');

  res.send(genre);
});

/* Delete a genre */
router.delete('/:id', [auth, admin], async (req, res) => {
  // auth() is a mw function that is exectuted before the next mw, which is admin(), and then the next mw, which is a route handler --> function(req, res)
  // '/api/genres:id'
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send('404 error - resource not found!');

  res.send(genre);
});

module.exports = router;

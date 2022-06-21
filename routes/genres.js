const express = require('express');
const mongoose = require('mongoose');

const Joi = require('joi');

const router = express.Router();

const Genre = mongoose.model('Genre', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  date: { type: Date, default: Date.now },
}));

/* const genres = [
  { id: 1, type: 'action' },
  { id: 2, type: 'drama' },
  { id: 3, type: 'sci-fi' },
  { id: 4, type: 'horror' },
]; */

// router.get('/');

/* Endpoint to get genres */
router.get('/', async (req, res) => { // /api/genres
  const genres = await Genre.find().sort('name'); // or '{name: 1}'
  res.send(genres);
});

/* Endpoint to get a single genre */
router.get('/:id', async (req, res) => { // /api/genres:id
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send('404 Error - Genre not found!');

  res.send(genre);
});

/* Add a genre */
router.post('/', async (req, res) => { // /api/genres
  const { error } = validate(req.body);// result = { error, value}
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({ name: req.body.name });
  let result;
  try {
    result = await genre.save();
    console.log('result: ', result);
  } catch (err) {
    console.log(err.errors);
  }
  res.send(result);
});

/* Update a genre */
router.put('/:id', async (req, res) => { // '/api/genres:id'
  const { error } = validate(req.body);// result = { error, value}
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }, // option to have updated course return. otherwise before updated will return
  ).catch((err) => console.log('No such id or something went wrong ', err));

  if (!genre) return res.status(404).send('404 Error - Resource not found');

  res.send(genre);
});

/* Delete a genre */
router.delete('/:id', async (req, res) => { // '/api/genres:id'
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send('404 error - resource not found!');

  res.send(genre);
});

function validate(genre) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });
  return schema.validate(genre);
}

module.exports = router;

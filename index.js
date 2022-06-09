// ! Create a http service for managing the list of genres in a movie rental service Vidly
// ? Each movie has a genre: action, horror, drama, sci-fi, comedy etc.
// - 1) Need endpoint for getting the list of genres, which will be in a drop down menu on client http://metflix.com/api/genres
// #2) Can create a new genre, read a genre, update an existing one, and delete one

const express = require('express');
const Joi = require('joi');

const app = express();
app.use(express.json());

const genres = [
  { type: 'action' },
  { type: 'drama' },
  { type: 'sci-fi' },
  { type: 'horror' },
];

function validate(genre) {
  const schema = Joi.object({
    type: Joi.string().min(3).required(),
  });
  return schema.validate(genre);
}

/* Homepage */
app.get('/', (req, res) => {
  res.send('<h1 style= "color: blue;">This is the homepage!</h1>');
});

/* Endpoint to get genres */
app.get('/api/genres', (req, res) => {
  res.send(genres);
});

/* Endpoint to get a single genre */
app.get('/api/genres/:type', (req, res) => {
  const genre = genres.find((g) => g.type === req.params.type);
  if (!genre) return res.status(404).send('404 Error - Genre not found!');

  res.send(genre);
});

/* Add a genre */
app.post('/api/genres', (req, res) => {
  const { error } = validate(req.body);// result = { error, value}
  if (error) return res.status(400).send(error.details[0].message);

  genres.push(req.body);
  res.send(req.body);
});

/* Update a genre */
app.put('/api/genres/:type', (req, res) => {
  const genre = genres.find((g) => g.type === req.params.type);
  if (!genre) return res.status(404).send('404 Error - Resource not found');

  const { error } = validate(req.body);// result = { error, value}
  if (error) return res.status(400).send(error.details[0].message);

  genre.type = req.body.type;
  res.send(genre);
});

/* Delete a genre */
app.delete('/api/genres/:type', (req, res) => {
  const genre = genres.find((g) => g.type === req.params.type);
  if (!genre) return res.status(404).send('404 error - resource not found!');

  const genreIndex = genres.indexOf(genre);
  genres.splice(genreIndex, 1);
  res.send(genre);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}...`));

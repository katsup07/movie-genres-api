const express = require('express');
const homeRouter = require('../routes/home');
const genresRouter = require('../routes/genres');
const customersRouter = require('../routes/customers');
const moviesRouter = require('../routes/movies');
const rentalsRouter = require('../routes/rentals');
const usersRouter = require('../routes/users');
const authRouter = require('../routes/auth');
const returnsRouter = require('../routes/returns');
const error = require('../middleware/error');

module.exports = function (app) {
  app.use(express.json()); // returns middleware fn - reads req and if json, parses it  req.body into json obj.

  /* Homepage */
  // ~ For any route that starts with '/' use homeRouter
  app.use('/', homeRouter);

  // ~ For any route that starts with '/api/genres' use genresRouter
  app.use('/api/genres', genresRouter);

  // ~ For any route that starts with '/customers' use customersRouter
  app.use('/api/customers', customersRouter);

  // ~ For any route that starts with '/movies' use moviesRouter
  app.use('/api/movies', moviesRouter);

  // ~ For any route that starts with '/rentals' use rentalsRouter
  app.use('/api/rentals', rentalsRouter);

  app.use('/api/users', usersRouter);

  app.use('/api/auth', authRouter);

  app.use('/api/returns', returnsRouter);

  app.use(error);
};

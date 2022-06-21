// ! Create a http service for managing the list of genres in a movie rental service Vidly
// ? Each movie has a genre: action, horror, drama, sci-fi, comedy etc.
// - 1) Need endpoint for getting the list of genres, which will be in a drop down menu on client http://metflix.com/api/genres
// #2) Can create a new genre, read a genre, update an existing one, and delete one
// * -------------------------------------------------------------------------------------------
// Mongoose connects here since this is where the app starts.
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/vidly')
  .then(console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDb...', err));

//! /* Start up code for application */
const express = require('express');
const homeRouter = require('./routes/home');
const genresRouter = require('./routes/genres');
const customersRouter = require('./routes/customers');

const app = express();

// set view engine for application. View engines allow us to render web pages using template files.
app.set('view engine', 'pug'); // express internally loads 'pug' module
app.set('views', './views');// templates are in this folder by default without needing to set here.

//! /* Middleware */
app.use(express.json());// returns middleware fn - reads req and if json parses it  req.body into json obj.

/* Homepage */
// ~ For any route that starts with '/' use homeRouter
app.use('/', homeRouter);

// ~ For any route that starts with '/api/genres' use genresRouter
app.use('/api/genres', genresRouter);

// ~ For any route that starts with '/customers' use customersRouter
app.use('/api/customers', customersRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}...`));

// eslint-disable-next-line max-len
// ? Note: Middleware functions are functions that have access to the request object ( req ), the response object ( res ), and the next function in the application's request-response cycle. The next function is a function in the Express router which, when invoked, executes the middleware succeeding the current middleware.

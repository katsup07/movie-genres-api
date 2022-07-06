// ! Create a http service for managing the list of genres in a movie rental service Vidly
// ? Each movie has a genre: action, horror, drama, sci-fi, comedy etc.
// - 1) Need endpoint for getting the list of genres, which will be in a drop down menu on client http://metflix.com/api/genres
// #2) Can create a new genre, read a genre, update an existing one, and delete one
// * -------------------------------------------------------------------------------------------
// Mongoose connects here since this is where the app starts.
const express = require('express');
const winston = require('winston');

const app = express();
// no need to install in const
require('./startup/initializeDB')();
require('./startup/validation')();
// initial config
require('./startup/config')();
// ~ Logging errors and exceptions
require('./startup/logging')();

require('./startup/routes')(app);

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on Port ${port}...`));

// eslint-disable-next-line max-len
// ? Note: Middleware functions are functions that have access to the request object ( req ), the response object ( res ), and the 'next' function in the application's request-response cycle. The 'next' function is a function in the Express router which, when invoked, executes the middleware succeeding the current middleware.

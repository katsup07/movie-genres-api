const express = require('express');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const { Customer } = require('../models/Customer');
const { Movie } = require('../models/Movie');
const { Rental, validateRental } = require('../models/Rental');

Fawn.init('mongodb://localhost/vidly');

const router = express.Router();

router.get('/', async (req, res) => {
  const rentals = await Rental.find()
    .sort('-dateOut') // sort by dateOut in descending order
    .catch((err) => res.send(err));
  if (!rentals) res.status(400).send('400 Error - Resource no found');

  res.send(rentals);
});

router.post('/', async (req, res) => {
  const { error } = validateRental(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check for valid customer id provided by client
  const customer = await Customer.findById(req.body.customerId).catch((err) => res.send(err));
  if (!customer) return res.status(400).send('Invalid customer.');

  // Check for valid movie id provided by client
  const movie = await Movie.findById(req.body.movieId).catch((err) =>res.send(err));
  if (!movie) return res.status(400).send('Invalid movie.');

  if (movie.numberInStock === 0)
    return res.status(400).send('Movie not in stock.');

  const rental = new Rental({
    customer: {
      _id: customer._id, // May need more info about customer in future, so can query with customer.id
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  // # Fawn provides the ability to carry out edits on a mongoDB database as a series of steps. If an error occurs on any of the steps, the database is returned to its initial state (its state before the transaction started). It's based on the two phase commit system described in the MongoDB docs. Check out this Medium article for a more detailed look.
  // # https://codeburst.io/fawn-transactions-in-mongodb-988d8646e564

  new Fawn.Task()
    .save('rentals', rental) // collection name is 'rentals' in mongoDB and case sensitive // use $inc = increment operator with -1 to decrement
    .update(
      'movies',
      { _id: movie._id },
      {
        $inc: { numberInStock: -1 },
      }
    )
    .run()
    .catch((ex) => res.status(500).send('Something faild')); // Maybe need try and catch here

  res.send(rental);

  // Note: use .remove() to remove.
});

module.exports = router;

// ! Notes from before transactions were added. The code in grey is what was there.
// const result = await rental.save().catch((err) => res(err)); // ! (1) or (2) below could fail, so should use a transaction
// ! A transaction means a group of operations that should be performed as a unit.
// movie.numberInStock--; // !  Either all complete or if one fails, then they are rolled back to initial state
// movie.save();//  ! (2)

// res.send(result);

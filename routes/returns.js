// ~ routes for /api/returns
const express = require('express');
const Joi = require('joi');
const { Rental } = require('../models/Rental');
const { Movie } = require('../models/Movie');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/* Endpoint to for rental returns */
// middleware validate(validateReturn) not working
router.post('/', auth, async (req, res) => {
  if (!req.body.customerId)
    return res.status(400).send('customerId not provided');
  if (!req.body.movieId) return res.status(400).send('movieId not provided');

  // refactored as static method in Rental class
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send('Rental not found');
  if (rental.dateReturned)
    return res.status(400).send('Return already processed');

  // refactored as instance method in Rental class
  rental.return();

  await rental.save();

  const result = await Movie.updateOne(
    { _id: req.body.movie._id },
    { $inc: { numberInStock: 1 } }
  );

  console.log('rental', rental);
  return res.status(200).send(rental);// express will set to 200 by default
});

// Used to validate input from client
function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });
  return schema.validate(req);
}

module.exports = router;

// ! the functions from moment do the same as calculating the rentalFee like below
// rental.rentalFee = Math.round(
//   ((rental.dateReturned - rental.dateOut) * rental.movie.dailyRentalRate) / (1000 * 86400)
// );

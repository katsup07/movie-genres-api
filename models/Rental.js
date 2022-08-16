const mongoose = require('mongoose');
const Joi = require('joi');
const moment = require('moment');
// Joi.objectId = require('joi-objectid')(Joi); // returns a function that we call with Joi module by passing reference 'joi'. This also returns a function which can be stored in 'Joi.objectId', so we'll call the method with Joi.objectId(). This will check that the movieId and customerId are of the correct mongoDB form when validating. The ids may still be no good, but at least of the right form.

const rentalSchema = new mongoose.Schema({
  customer: {
    // A customer can have many more properties, and don't want them all inside this object, so here defined a new customer schema that is different from the one in Customer.js. Only important properties are displayed here.
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
      isGold: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
    }),
    required: true,
  },
  movie: {
    // A new movie schema different from Movie.js, since only need important properties, not all of them here.
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    }),
    required: true,
  },
  dateOut: {
    // set on server
    type: Date,
    required: true,
    default: Date.now,
  },
  dateReturned: {
    // set on server
    type: Date,
  },
  rentalFee: {
    // set on server
    type: Number,
    min: 0,
  },
});

// const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
rentalSchema.statics.lookup = function (customerId, movieId) {
  return this.findOne({
    'customer._id': customerId,
    'movie._id': movieId,
  });
};

rentalSchema.methods.return = function () {
  this.dateReturned = new Date();

  const rentalDays = moment().diff(this.dateOut, 'days'); // moment gives current date
  this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};
const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
  const schema = Joi.object({
    // Very different from schema defined in rental documents, because
    customerId: Joi.objectId().required(), // these are the two ids provided by the client
    movieId: Joi.objectId().required(),
  });

  return schema.validate(rental);
}

module.exports = { Rental, validateRental };

// ! Maybe something like this could work too, but need to return an error to the function that's calling it instead of sending a response back.
/* function validateRental(rental, res) {
  const schema = Joi.object({
    // Very different from schema defined in rental documents, because
    customerId: Joi.string().required(), // these are the two ids provided by the client
    movieId: Joi.string().required(),
  });
  // eslint-disable-next-line prettier/prettier
  // !! if (!mongoose.Types.ObjectId.isValid(rental.customerId) || !mongoose.Types.ObjectId.isValid(rental.movieId))
  // !!  return res.status(400).send('Invalid customerId or movieId');

  return schema.validate(rental);
} */

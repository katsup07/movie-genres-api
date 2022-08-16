const moment = require('moment');
const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../models/User');
const { Rental } = require('../../models/Rental');
const { Movie } = require('../../models/Movie');

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  const exec = () =>
    request(server)
      .post('/api/returns')
      .set('x-auth-token', token) // in header
      .send({ customerId, movieId, movie }); // in body

  beforeEach(async () => {
    server = require('../../index');

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: '12345',
      genre: {
        name: '12345',
      },
      numberInStock: 10,
      dailyRentalRate: 2,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345',
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2,
      },
    });
    await rental.save();
  });
  afterEach(async () => {
    await server.close();
    await Rental.remove({});
    await Movie.remove({});
  });
  it('should return 401 if client not logged in', async () => {
    token = '';
    const res = await exec(); // refactored and created exec(). See above for details.

    expect(res.status).toBe(401);
  });

  it('should return 400 if customerId is not provided', async () => {
    customerId = '';

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 400 if movieId is not provided', async () => {
    movieId = '';
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental is found for this customer/movie', async () => {
    await Rental.remove({});

    const res = await exec();
    expect(res.status).toBe(404);
  });

  it('should return 400 if rental already processed', async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200 if valid request', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should set the returnDate if input is valid', async () => {
    const res = await exec();
    const rentalInDB = await Rental.findById(rental._id);
    const difference = new Date() - rentalInDB.dateReturned;
    console.log(rentalInDB.dateReturned);
    expect(difference).toBeLessThan(1000);
  });

  it('should calculate the rental fee if input is valid', async () => {
    // moment() gets the current time
    rental.dateOut = moment().add(-7, 'days').toDate();
    await rental.save();
    const res = await exec();
    const rentalInDB = await Rental.findById(rental._id);
    // console.log('rentalInDB', rentalInDB);
    // console.log('difference', rentalInDB.dateout - rentalInDB.dateReturned);
    expect(rentalInDB.rentalFee).toBe(14);
  });

  it('should increase the movie stock if the input is valid', async () => {
    const res = await exec();

    const movieInDB = await Movie.findById(movie._id);

    expect(movieInDB.numberInStock).toBe(movie.numberInStock + 1);
  });

  it('should return the rental in body of response if input is valid', async () => {
    const res = await exec();
    console.log('res.body', res.body);
    const rentalInDB = await Rental.findById(rental._id);
    
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('customer');
    expect(res.body).toHaveProperty('movie');
    expect(res.body).toHaveProperty('dateOut');
    expect(res.body).toHaveProperty('dateReturned');
    expect(res.body).toHaveProperty('rentalFee');
    expect(res.body.customer.name).toBe(rental.customer.name);
  });
});

/* eslint-disable global-require */
const mongoose = require('mongoose');
const request = require('supertest');
const { Genre } = require('../../models/Genre');
const { User } = require('../../models/User');
// server will already be running after the first test, but jest will try to load it again for each test, but this will cause an error, so need to close it at the end. This is why beforeEach() and afterEach() are used below in jest.
// ! Code coverage tool with jest can show which areas of code need more testing
let server;

describe('/api/genres', () => {
  // start and stop the erver in each test
  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({}); // Every time modify code, will add two genresand they will accumulate and make the test fail, so need to remove at end. Whenever modifying the state, should always clean up after.
  });

  describe('GET / ', () => {
    it('should return all genres', async () => {
      Genre.collection.insertMany([{ name: 'genre1' }, { name: 'genre2' }]);

      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some((g) => g.name === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id ', () => {
    it('should return a single genre if valid id is passed', async () => {
      // This works too
      // const { insertedId } = await Genre.collection.insertOne({ name: 'genre1' });
      // console.log('here is the result!!!!!', insertedId.toJSON());
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      // const res = await request(server).get(`/api/genres/${insertedId.toJSON()}`);
      const res = await request(server).get(`/api/genres/${genre._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
      // expect(res.body.name).toBe('genre1');
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get(`/api/genres/1`);
      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with given id exists ', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/genres/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    /* Refactoring test code to make code cleaner */
    // = Define the happy path, and then in each test, change one parameter that clearly aligns with the name of the test.
    let token;
    let name;

    const exec = async () =>
      await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
    });

    it('should return a 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return a 400 if genre is less than 5 characters', async () => {
      name = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return a 400 if genre is more than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      const res = await exec();

      const genre = await Genre.find({ name: '12345' });
      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec(); // code refactoring above

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let genre;
    let id;
    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();

      token = new User({ isAdmin: true }).generateAuthToken();
    });

    afterEach(async () => {
      await Genre.deleteMany({});
    });

    it('should return a 401 error if client is not logged in', async () => {
      const res = await request(server).delete('/api/genres/1');
      expect(res.status).toBe(401);
    });

    it('should return a 403 error if user is not admin', async () => {
      token = new User().generateAuthToken();
      const res = await request(server)
        .delete('/api/genres/1')
        .set('x-auth-token', token);

      expect(res.status).toBe(403);
    });
    it('should return a 404 if user is admin, but no such id and id is of the wrong form for mongoDB', async () => {
      const id = 1;

      const res = await request(server)
        .delete(`/api/genres/${id}`)
        .set('x-auth-token', token)
        .send();

      expect(res.status).toBe(404);
    });

    it('should return a 404 if user is admin and id is of valid form, but no such id in mongoDB ', async () => {
      id = genre._id;
      const res = await request(server)
        .delete(`/api/genres/${'62b06a12a97d5f44b131a803'}`)
        .set('x-auth-token', token)
        .send();

      expect(res.status).toBe(404);
    });

    it('should return a 200 if user is admin and id is valid', async () => {
      id = genre._id;
      const res = await request(server)
        .delete(`/api/genres/${id}`)
        .set('x-auth-token', token)
        .send();

      expect(res.status).toBe(200);
    });
  });
});

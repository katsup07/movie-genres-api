const request = require('supertest');
const { User } = require('../../models/User');
const { Genre } = require('../../models/Genre');

let server;
let token;

describe('auth middleware ', () => {
  // start and stop the erver in each test
  beforeEach(() => {
    server = require('../../index');
    token = new User().generateAuthToken();
  });
  afterEach(async () => {
    await server.close();
    await Genre.remove({}); // deleteMany({}) works too
  });

  const exec = () =>
    // Can return here without awaiting, since not using the promise result for anything here
    request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: 'genre1' });

  it('should return 401 if no token is provided', async () => {
    token = '';
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it('should return 400 if invalid token', async () => {
    token = 'a';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200 if valid token', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});

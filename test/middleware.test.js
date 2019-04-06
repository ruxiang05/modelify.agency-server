/* Agent tests, uses mongoose, jwt and supertest methods */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const server = require('../src/server');
const keys = require('../config/keys');

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.disconnect(done);
  });
});

describe('Middleware', () => {
  const user = {
    email: 'inexistent@inexistent.com',
  };

  const token = jwt.sign(
    { user },
    keys.JWT_SECRET,
  );
  it('should error if there are is no auth header', async () => {
    const data = await request(server)
      .get('/jobs/all');
    expect(data.status).toBe(403);
    expect(data.body.error).toBeDefined();
  });

  it('should error if there are is no token', async () => {
    const data = await request(server)
      .get('/jobs/all')
      .set('Authorization', 'Bearer ');
    expect(data.status).toBe(403);
    expect(data.body.error).toBeDefined();
  });

  it('should error if token is invalid', async () => {
    const data = await request(server)
      .get('/jobs/all')
      .set('Authorization', 'Bearer invalidToken');
    expect(data.status).toBe(500);
    expect(data.body.error).toBeDefined();
  });

  it('should error if the user inside the token is not registered', async () => {
    const data = await request(server)
      .get('/jobs/all')
      .set('Authorization', `Bearer ${token}`);

    expect(data.status).toBe(404);
    expect(data.body.error).toBeDefined();
  });
});

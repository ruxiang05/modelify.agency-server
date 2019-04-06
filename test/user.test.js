/* Agent tests, uses mongoose, jwt bcrypt and supertest methods */
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const server = require('../src/server');
const keys = require('../config/keys');
const User = require('../src/models/user');

const { JWT_SECRET } = keys;
afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.disconnect(done);
  });
});

describe('User', () => {
  let agentToken;
  describe('Signup', () => {
    const user = {
      name: 'test',
      password: '123',
      phoneNumber: '012345678',
    };

    const agent = {
      email: 'agent@agent.com',
      ...user,
      role: 'agent',
    };

    it('should signup model', async () => {
      const model = {
        email: 'model@model.com',
        ...user,
        role: 'model',
      };
      const data = await request(server)
        .post('/users/signup')
        .send(model);

      expect(data.status).toBe(200);
      expect(data.body.message).toBe('User created');
    });

    it('should signup agent', async () => {
      const data = await request(server)
        .post('/users/signup')
        .send(agent);

      expect(data.status).toBe(200);
      expect(data.body.message).toBe('User created');
    });

    it('should not duplicate entity', async () => {
      const data = await request(server)
        .post('/users/signup')
        .send(agent);

      expect(data.status).toBe(409);
      expect(data.body.error).toBeDefined();
    });

    it('should error if bcrypt fails on hash', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.reject(new Error('bcrypt error')));
      const data = await request(server)
        .post('/users/signup')
        .send({
          email: 'fail@fail.com',
          ...user,
          role: 'agent',
        });
      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });

    it('should error if mongo fails on save', async () => {
      jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .post('/users/signup')
        .send({
          email: 'fail@fail.com',
          ...user,
          role: 'agent',
        });
      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });

  describe('Login', () => {
    const agent = {
      email: 'agent@agent.com',
      password: '123',
    };

    it('should login user', async () => {
      const data = await request(server)
        .post('/users/login')
        .send(agent);

      agentToken = data.body.token;
      expect(data.status).toBe(200);
      expect(data.body.token).toBeDefined();
    });
    it('should not login inexistent user', async () => {
      const data = await request(server)
        .post('/users/login')
        .send({
          email: 'inexistent@test.com',
          password: 'inexistent',
        });
      expect(data.body.error).toBeDefined();
    });
    it('should not login user with incorrect password', async () => {
      const data = await request(server)
        .post('/users/login')
        .send({
          email: 'agent@agent.com',
          password: 'inexistent',
        });
      expect(data.body.error).toBeDefined();
    });
    it('should error if bcrypt fails on hash', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.reject(new Error('bcrypt error')));
      const data = await request(server)
        .post('/users/login')
        .send(agent);

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });

    it('should error if mongo fails on finding user', async () => {
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .post('/users/login')
        .send(agent);

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });

  describe('Update', () => {
    const agent = {
      email: 'agent@agent.com',
      name: 'name',
      password: '123',
      phoneNumber: '012345678',
      role: 'agent',
    };

    it('should update basic information', async () => {
      const data = await request(server)
        .put('/users/edit')
        .set('Authorization', `Brearer ${agentToken}`)
        .send(agent);
      expect(data.status).toBe(200);
      const { token } = data.body;
      expect(token).toBeDefined();
      const decoded = await jwt.verify(token, JWT_SECRET);
      expect(decoded.user.name).toBe('name');
    });

    it('should error if mongo fails on updating user', async () => {
      jest.spyOn(User, 'findOneAndUpdate').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .put('/users/edit')
        .set('Authorization', `Brearer ${agentToken}`)
        .send(agent);

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });
});

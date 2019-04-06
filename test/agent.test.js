/* Agent tests, uses mongoose and supertest methods */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../src/server');

let agentToken;
const model = {
  email: 'model@model.com',
  name: 'name',
  password: '123',
  phoneNumber: '012345678',
  role: 'model',
};

beforeAll(async (done) => {
  await request(server)
    .post('/users/signup')
    .send({
      email: 'agent@agent.com',
      name: 'name',
      password: '123',
      phoneNumber: '012345678',
      role: 'agent',
    });

  const agentLogin = await request(server)
    .post('/users/login')
    .send({
      email: 'agent@agent.com',
      password: '123',
    });
  agentToken = agentLogin.body.token;

  await request(server)
    .post('/users/signup')
    .send(model);

  done();
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.disconnect(done);
  });
});

describe('Agent', () => {
  describe('Add model', () => {
    it('should add model', async () => {
      const data = await request(server)
        .post('/agents/add-model')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          model: model.email,
        });

      expect(data.status).toBe(200);
      expect(data.body.agent.agentInfo.models.length).toBe(1);
    });

    it('should not add model twice', async () => {
      const data = await request(server)
        .post('/agents/add-model')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          model: model.email,
        });
      expect(data.status).toBe(401);
      expect(data.body.error).toBeDefined();
    });

    it('should not add inexistent model', async () => {
      const data = await request(server)
        .post('/agents/add-model')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          model: 'inexistent@inexistent.com',
        });
      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });

    it('should error if no model is provided', async () => {
      const data = await request(server)
        .post('/agents/add-model')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({});
      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });

  describe('Get models', () => {
    it('should get all models', async () => {
      const data = await request(server)
        .get('/agents/')
        .set('Authorization', `Brearer ${agentToken}`);

      const retrievedModels = data.body.agent.agentInfo.models;
      expect(data.status).toBe(200);
      expect(retrievedModels.length).toBe(1);
      expect(retrievedModels[0].email).toBeDefined();
    });
  });
});

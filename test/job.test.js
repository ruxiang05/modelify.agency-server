const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const server = require('../src/server');
const keys = require('../config/keys');
const Job = require('../src/models/job');

const { JWT_SECRET } = keys;
let agentToken;
let modelToken;
let model;
let jobId;

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
    .send({
      email: 'model@model.com',
      name: 'name',
      password: '123',
      phoneNumber: '012345678',
      role: 'model',
    });

  const modelLogin = await request(server)
    .post('/users/login')
    .send({
      email: 'model@model.com',
      password: '123',
    });
  modelToken = modelLogin.body.token;
  model = jwt.verify(modelToken, JWT_SECRET).user;
  done();
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.disconnect(done);
  });
});
describe('Job', () => {
  describe('Create', () => {
    it('should create job', async () => {
      const job = {
        model: model.email,
        title: 'title',
        date: Date.now(),
        address: 'address',
        pay: 100,
        description: 'description',
      };

      const data = await request(server)
        .post('/jobs/create')
        .set('Authorization', `Brearer ${agentToken}`)
        .send(job);
      const createdJob = data.body.job;
      jobId = createdJob._id;
      expect(data.status).toBe(200);
      expect(createdJob).toBeDefined();
    });

    it('should not create job if model email is missing', async () => {
      const job = {
        title: 'title',
        date: Date.now(),
        address: 'address',
        pay: 100,
        description: 'description',
      };
      const data = await request(server)
        .post('/jobs/create')
        .set('Authorization', `Brearer ${agentToken}`)
        .send(job);

      expect(data.body.error).toBeDefined();
    });

    it('should not create job if title is missing', async () => {
      const job = {
        model: model.email,
        date: Date.now(),
        address: 'address',
        pay: 100,
        description: 'description',
      };
      const data = await request(server)
        .post('/jobs/create')
        .set('Authorization', `Brearer ${agentToken}`)
        .send(job);

      expect(data.body.error).toBeDefined();
    });
  });

  describe('Retrieve', () => {
    it('should get all jobs for user', async () => {
      const data = await request(server)
        .get('/jobs/all')
        .set('Authorization', `Brearer ${agentToken}`);
      expect(data.status).toBe(200);
      expect(data.body.jobs.length).toEqual(1);
    });

    it('should error if mongo fails on finding jobs', async () => {
      jest.spyOn(Job, 'find').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .get('/jobs/all')
        .set('Authorization', `Brearer ${agentToken}`);

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });

  describe('Update', () => {
    it('should update job', async () => {
      const data = await request(server)
        .put('/jobs/update')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          id: jobId,
          pay: 1000,
        });
      const updatedJob = data.body.job;
      expect(data.status).toBe(200);
      expect(updatedJob.pay).toBe(1000);
      expect(updatedJob.title).toBe('title');
    });

    it('should error if mongo fails on updating job', async () => {
      jest.spyOn(Job, 'findOneAndUpdate').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .put('/jobs/update')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          id: jobId,
          pay: 1000,
        });

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });

  describe('Accept', () => {
    it('should set job status to "in progress"', async () => {
      const data = await request(server)
        .put('/jobs/accept')
        .set('Authorization', `Brearer ${modelToken}`)
        .send({ id: jobId });
      expect(data.status).toBe(200);
      expect(data.body.job.status).toBe('in progress');
    });

    it('should error if mongo fails on accepting job', async () => {
      jest.spyOn(Job, 'findOneAndUpdate').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .put('/jobs/accept')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({ id: jobId });

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });

  describe('Complete', () => {
    it('should set job status to "complete"', async () => {
      const data = await request(server)
        .put('/jobs/complete')
        .set('Authorization', `Brearer ${modelToken}`)
        .send({
          id: jobId,
        });
      expect(data.status).toBe(200);
      expect(data.body.job.status).toBe('complete');
    });

    it('should error if mongo fails on completing job', async () => {
      jest.spyOn(Job, 'findOneAndUpdate').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .put('/jobs/complete')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          id: jobId,
        });

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });

  describe('Decline', () => {
    it('should set job status to "declined"', async () => {
      const data = await request(server)
        .put('/jobs/decline')
        .set('Authorization', `Brearer ${modelToken}`)
        .send({
          id: jobId,
        });

      expect(data.status).toBe(200);
      expect(data.body.job.status).toBe('declined');
    });

    it('should error if mongo fails on declining job', async () => {
      jest.spyOn(Job, 'findOneAndUpdate').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .put('/jobs/decline')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          id: jobId,
        });

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });

  describe('Delete', () => {
    it('should delete job', async () => {
      const data = await request(server)
        .delete('/jobs/delete')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          id: jobId,
        });

      expect(data.status).toBe(200);
      expect(data.body.message).toBeDefined();
    });

    it('should error if mongo fails on deleting job', async () => {
      jest.spyOn(Job, 'findOneAndDelete').mockImplementationOnce(() => Promise.reject(new Error('mongo error')));
      const data = await request(server)
        .delete('/jobs/delete')
        .set('Authorization', `Brearer ${agentToken}`)
        .send({
          id: jobId,
        });

      expect(data.status).toBe(500);
      expect(data.body.error).toBeDefined();
    });
  });
});

/* Agent tests, uses mongoose, jwt and supertest methods */
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const server = require('../src/server');
const keys = require('../config/keys');
const Chat = require('../src/models/chat');
const { getChatsForId, addMessage } = require('../src/controllers/chat');

const { JWT_SECRET } = keys;
let agentToken;
let agent;
let modelToken;
let model;
let chat;

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
  agent = jwt.verify(agentToken, JWT_SECRET).user;

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

describe('Chat', () => {
  describe('Create', () => {
    it('should create chat on job creation', async () => {
      const job = {
        model: model.email,
        title: 'title',
        date: Date.now(),
        address: 'address',
        pay: 100,
        description: 'description',
      };

      await request(server)
        .post('/jobs/create')
        .set('Authorization', `Brearer ${agentToken}`)
        .send(job);

      const data = await Chat.find({}).exec();
      [chat] = data;
      expect(data.length).toBe(1);
    });
  });

  describe('Retreive', () => {
    it('should get all chats for user', async () => {
      const data = await request(server)
        .get('/chats')
        .set('Authorization', `Brearer ${agentToken}`);
      expect(data.body.chats.length).toBe(1);
    });

    it('should get chats for id', async () => {
      const data = await getChatsForId(agent._id);
      expect(data.length).toBe(1);
    });

    it('should retrieve sorted chats', async () => {
      const job = {
        model: model.email,
        title: 'title',
        date: Date.now(),
        address: 'address',
        pay: 100,
        description: 'description',
      };
      await request(server)
        .post('/jobs/create')
        .set('Authorization', `Brearer ${agentToken}`)
        .send(job);
      const data = await request(server)
        .get('/chats')
        .set('Authorization', `Brearer ${agentToken}`);
      const { chats } = data.body;
      const date1 = chats[0].job.date;
      const date2 = chats[1].job.date;
      expect(chats.length).toBe(2);
      expect(date1 > date2).toBeTruthy();
    });
  });

  describe('Add message', () => {
    it('should add message', async () => {
      await addMessage({
        room: chat._id,
        user: agent._id,
        message: 'test',
      });

      const data = await Chat.findOne({ _id: chat._id }).exec();
      expect(data.messages.length).toBe(1);
    });
  });

  describe('Get message', () => {
    it('should get messages', async () => {
      const data = await request(server)
        .get('/chats/getMessages')
        .query(`id=${chat._id}`)
        .set('Authorization', `Brearer ${agentToken}`);
      expect(data.status).toBe(200);
      expect(data.body.messages.length).toBe(1);
    });
  });
});

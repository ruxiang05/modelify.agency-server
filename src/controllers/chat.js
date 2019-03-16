const mongoose = require('mongoose');
const Chat = require('../models/chat');
const Message = require('../models/message');

const createChat = (job) => {
  const newChat = new Chat({
    _id: new mongoose.Types.ObjectId(),
    users: [job.model, job.agent],
    job,
  });
  newChat.save();
};

const getChats = (req, res) => {
  const { user } = req;
  if (user) {
    Chat.find({ users: { $in: [user.id] } }).populate('job users messages').exec((err, chats) => {
      chats.sort((a, b) => b.job.date - a.job.date);
      if (err) return res.status(400).json({ error: 'Could not find chats' });
      return res.status(200).json({ message: 'Chats found', chats });
    });
  } else {
    return res.status(400).json({ error: 'No user provided' });
  }
};

const getChatsForId = id => Chat.find({ users: { $in: [id] } }).distinct('_id');

const addMessage = (data) => {
  const { user, message, room } = data;
  const newMessage = new Message({
    _id: new mongoose.Types.ObjectId(),
    user,
    message,
  });
  newMessage.save().then((savedMessage) => {
    Chat.findById(room, (err, foundChat) => {
      if (err) return err;
      foundChat.messages.push(savedMessage);
      foundChat.save();
    });
  });
};

const getMessages = (req, res) => {
  const { user } = req;
  const { id } = req.query;
  if (user) {
    Chat.findById(id).populate('messages').exec((err, chat) => {
      const { messages } = chat;
      if (err) return res.status(400).json({ error: 'Could not find messages' });
      return res.status(200).json({ message: 'Messages found', messages });
    });
  } else {
    return res.status(400).json({ error: 'No user provided' });
  }
};

module.exports = {
  createChat,
  getChats,
  getChatsForId,
  addMessage,
  getMessages,
};

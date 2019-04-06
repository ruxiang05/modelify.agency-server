/* Chat controller, uses moongoose methods */
const mongoose = require('mongoose');
const Chat = require('../models/chat');
const Message = require('../models/message');

const createChat = async (job) => {
  const newChat = new Chat({
    _id: new mongoose.Types.ObjectId(),
    users: [job.model, job.agent],
    job,
  });
  await newChat.save();
};

const getChats = (req, res) => {
  const { user } = req;
  Chat.find({ users: { $in: [user.id] } }).populate('job users messages').exec((err, chats) => {
    if (err) return res.status(400).json({ error: 'Could not find chats' });
    if (chats.length > 1) { chats.sort((a, b) => b.job.date - a.job.date); }
    return res.status(200).json({ message: 'Chats found', chats });
  });
};

const getChatsForId = id => Chat.find({ users: { $in: [id] } }).distinct('_id');

const addMessage = async (data) => {
  const { user, message, room } = data;
  const newMessage = new Message({
    _id: new mongoose.Types.ObjectId(),
    user,
    message,
  });

  const savedMessage = await newMessage.save();
  const foundChat = await Chat.findOne({ _id: room }).exec();
  // Link message to the chat
  foundChat.messages.push(savedMessage._id);
  const updatedChat = await foundChat.save();
  return updatedChat;
};

const getMessages = (req, res) => {
  const { id } = req.query;
  Chat.findOne({ _id: id }).populate('messages').exec((err, chat) => {
    if (err) return res.status(400).json({ error: 'Could not find messages' });
    const { messages } = chat;
    return res.status(200).json({ message: 'Messages found', messages });
  });
};

module.exports = {
  createChat,
  getChats,
  getChatsForId,
  addMessage,
  getMessages,
};

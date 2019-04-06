/* Chat schema, uses moongoose methods */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatSchema = new Schema({
  id: Schema.Types.ObjectId,
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  job: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Job',
  },
});

module.exports = mongoose.model('Chat', ChatSchema);

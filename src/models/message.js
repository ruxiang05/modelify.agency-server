const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  id: Schema.Types.ObjectId,
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', MessageSchema);

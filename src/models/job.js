const mongoose = require('mongoose');

const { Schema } = mongoose;

const JobSchema = new Schema({
  _id: Schema.Types.ObjectId,
  agent: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  model: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
  title: {
    type: String,
    required: true,
  },
  date: Date,
  address: String,
  pay: Number,
  description: String,
});

module.exports = mongoose.model('Job', JobSchema);

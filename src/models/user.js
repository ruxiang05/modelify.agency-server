const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);


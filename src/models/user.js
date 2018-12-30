const mongoose = require('mongoose');

const { Schema } = mongoose;

const isModel = () => this.role === 'model';
const isAgent = () => this.role === 'agent';
const UserSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  role: {
    type: ['model', 'agent'],
    required: true,
  },
  agentInfo: {
    models: {
      type: [String],
      required: isAgent(),
      default: undefined,
    },
  },
  modelInfo: {
    dateOfBirth: {
      type: Date,
      required: isModel(),
    },
    address: String,
    characteristics: {
      eyes: String,
      hair: String,
    },
    measurements: {
      height: String,
      weight: String,
      chest: String,
      waist: String,
      hips: String,
    },
  },
});

module.exports = mongoose.model('User', UserSchema);

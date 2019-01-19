const mongoose = require('mongoose');

const { Schema } = mongoose;

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
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['model', 'agent'],
    required: true,
  },
  googleCalendarAPIToken: {
    type: Object,
    default: '',
  },
  agentInfo: {
    models: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  modelInfo: {
    dateOfBirth: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    characteristics: {
      eyes: {
        type: String,
        default: '',
      },
      hair: {
        type: String,
        default: '',
      },
      skin: {
        type: String,
        default: '',
      },
    },
    measurements: {
      height: {
        type: String,
        default: '',
      },
      weight: {
        type: String,
        default: '',
      },
      chest: {
        type: String,
        default: '',
      },
      waist: {
        type: String,
        default: '',
      },
      hips: {
        type: String,
        default: '',
      },
    },
  },
});

module.exports = mongoose.model('User', UserSchema);

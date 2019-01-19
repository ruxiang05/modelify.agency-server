const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const keys = require('../../config/keys');

const signup = (req, res) => {
  const {
    email, password, ...details
  } = req.body;
  // Check if user already exists
  User.find({ email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          error: 'Email already used',
        });
      }
      bcrypt.hash(password, 10).then((hash) => {
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          email,
          password: hash,
          ...details,
        });
        newUser
          .save()
          .then(() => res.status(200).json({ message: 'User created' }))
          .catch(() => res.status(500).json({ error: 'Could not create user' }));
      }).catch(() => res.status(500).json({ error: 'Hashing failed' }));
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: 'Email not found',
        });
      }
      bcrypt.compare(password, user.password).then((result) => {
        if (result) {
          const userData = user.toObject();
          delete userData.password;
          delete userData.__v; //eslint-disable-line
          const token = jwt.sign(
            {
              user: userData,
            },
            keys.JWT_SECRET,
            {
              expiresIn: '24h',
            },
          );
          return res.status(200).json({
            message: 'Auth successful',
            token,
          });
        }
        return res.status(401).json({ error: 'Wrong password' });
      }).catch(() => res.status(500).json({ error: 'Auth failed' }));
    })
    .catch(err => res.status(500).json({ error: err }));
};

const updateUser = (req, res) => {
  const { user, body: newDetails } = req;
  User.findOneAndUpdate({ _id: user.id }, newDetails, { new: true }).then((updatedUser) => {
    const userData = updatedUser.toObject();
    delete userData.password;
        delete userData.__v; //eslint-disable-line
    const token = jwt.sign(
      {
        user: userData,
      },
      keys.JWT_SECRET,
      {
        expiresIn: '24h',
      },
    );
    return res.status(200).json({ message: 'Updated user', token });
  })
    .catch(() => res.status(500).json({ error: 'Could not update user' }));
};

module.exports = {
  signup,
  login,
  updateUser,
};

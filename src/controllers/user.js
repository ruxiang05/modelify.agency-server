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
      return bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ error: 'Hashing failed' });
        }
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
      });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  // TODO: delete password and v with select
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: 'Email not found',
        });
      }
      return bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({ error: 'Auth failed' });
        }
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
        return res.status(401).json({ message: 'Wrong password' });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

const updateUser = (req, res) => {
  const { user, body: newDetails } = req;
  if (user) {
    User.findOneAndUpdate({ _id: user.id }, newDetails, (err, updatedUser) => {
      if (err) return res.status(400).json({ error: 'Could not update user' });
      if (updatedUser) {
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
      }
    });
  } else {
    return res.status(401).json({ error: 'User not provided' });
  }
};

const deleteUser = (req, res) => {
  const { user } = req;
  if (user) {
    User.findByIdAndDelete(user.id, (err) => {
      if (err) return res.status(400).json({ error: 'User could not be deleted' });
      return res.status(200).json({ message: 'User deleted' });
    });
  } else {
    return res.status(401).json({ error: 'User not provided' });
  }
};

module.exports = {
  signup,
  login,
  updateUser,
  deleteUser,
};

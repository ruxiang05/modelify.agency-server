const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const keys = require('../../config/keys');

const signup = (req, res) => {
  const {
    email, password, role, firstName, lastName, phoneNumber, agentInfo, modelInfo,
  } = req.body;

  // Check if user already exists
  User.find({ email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Email already used',
        });
      }
      return bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          email,
          password: hash,
          firstName,
          lastName,
          phoneNumber,
          role,
        });
        switch (role) {
          case 'agent': {
            newUser.agentInfo = agentInfo;
            break;
          }
          case 'model': {
            newUser.modelInfo = modelInfo;
            break;
          }
          default:
        }

        newUser
          .save()
          .then(() => res.status(200).json({ message: 'User created' }))
          .catch(error => res.status(500).json({ error }));
      });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed',
        });
      }
      return bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({ message: 'Auth failed' });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              id: user.id,
            },
            keys.JWT_SECRET,
            {
              expiresIn: '1h',
            },
          );
          return res.status(200).json({
            message: 'Auth successful',
            token,
          });
        }
        return res.status(401).json({ message: 'Auth failed' });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .exec()
    .then(() => {
      res.status(200).json({
        message: 'User deleted',
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

module.exports = {
  signup,
  login,
  deleteUser,
};

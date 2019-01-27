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
          success: false,
          message: 'Email already used',
        });
      }
      return bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ success: false, error: err });
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
          .then(() => res.status(200).json({ success: true, message: 'User created' }))
          .catch(error => res.status(500).json({ success: false, error }));
      });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email not found',
        });
      }
      return bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Auth failed' });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              id: user.id,
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
      res.status(500).json({ success: false, error: err });
    });
};

const getUserFromJwt = (req, res) => {
  if (!req.headers && !req.headers.authorization) {
    return res.json(403).json({ success: false, error: 'No authorization header' });
  }
  const token = req.headers.authorization.split(' ')[1];
  if (token) {
    const decoded = jwt.verify(token, keys.JWT_SECRET);
    User.findOne({ email: decoded.email }).select('-password').then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      return user;
    });
  } else {
    return res.status(403).json({ success: false, error: 'No token provided' });
  }
};

const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .exec()
    .then(() => {
      res.status(200).json({
        success: true,
        message: 'User deleted',
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
};

module.exports = {
  signup,
  login,
  deleteUser,
  getUserFromJwt,
};

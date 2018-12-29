const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

const signup = (req,res) => {
  const {email, password, role, firstName, lastName, phoneNumber, agentInfo, modelInfo} = req.body;
  console.log(req.body);
  //Check if user already exists
  User.find({email: email})
  .exec()
  .then(user => {
    if (user.length >= 1) {
      return res.status(409).json({
        message: 'Email already used'
      });
    } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            const newUser = {
              _id: new mongoose.Types.ObjectId(),
              email,
              password: hash,
              firstName,
              lastName,
              phoneNumber,
              role
            }
            switch (role){
              case 'agent': {
                newUser.agentInfo = agentInfo;
              }
              case 'model': {
                newUser.modelInfo = modelInfo;
              }
            }
            console.log({...newUser});
            const user = new User({
              ...newUser
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(200).json({ message: 'User created' });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
              });
          }
        });
    }
  });
}

const login = (req, res) => {
  const {email, password} = req.body;
  User.findOne({ email: email })
    .then(user => {
      if(!user) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if(err) {
          return res.status(401).json({ message: 'Auth failed' });
        }
        if (result) {
          const token = jwt.sign(
            { email: user.email,
              id: user._id
            },
            keys.JWT_SECRET,
            {
              expiresIn: "1h"
            }
        );
          return res.status(200).json({
            message: "Auth successful",
            token
          });
        }
        return res.status(401).json({ message: 'Auth failed' });

      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
}

const deleteUser = (req, res) => {
  User.deleteOne({_id: req.params.id})
  .exec()
  .then(result => {
    console.log(result);
    res.status(200).json({
      message: "User deleted"
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
}

module.exports = {
  signup,
  login,
  deleteUser
}
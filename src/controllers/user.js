const db = require('../db');

const User = require('../models/user');

const getUserById = (req,res) => {
  const id = parseInt(req.params.id, 10);
  db.map((user) => {
    if (user.id === id) {
      return res.status(200).send({
        success: 'true',
        message: 'User retrieved successfully',
        user,
      });
    }
  });
  return res.status(404).send({
    success: 'false',
    message: 'User does not exist',
  });
}

module.exports = {
  getUserById
}
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('./models/user');

const verifyToken = (req, res, next) => {
  if (!req.headers && !req.headers.authorization) {
    return res.json(403).json({ success: false, error: 'No authorization header' });
  }
  const token = req.headers.authorization.split(' ')[1];
  if (token) {
    jwt.verify(token, keys.JWT_SECRET, (err, decoded) => {
      if (err) return res.json({ success: false, error: 'Invalid token.' });
      User.findOne({ email: decoded.email }).select('-password').then((user) => {
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }
        req.user = user;
        next();
      });
    });
  } else {
    return res.status(403).json({ success: false, error: 'No token provided' });
  }
};

module.exports = { verifyToken };
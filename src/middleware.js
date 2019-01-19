const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('./models/user');

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No authorization header' });
  }
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, keys.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ error: 'Invalid token.' });
    User.findOne({ email: decoded.user.email }).select('-password').then((user) => {
      if (!user) {
        return res.status(404).json({
          error: 'Token user not found',
        });
      }
      req.user = user;
      next();
    });
  });
};


module.exports = { verifyToken };

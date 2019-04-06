/* User routes, uses express methods */
const express = require('express');
const { verifyToken } = require('../middleware');

const router = express.Router();
const UserController = require('../controllers/user');

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.put('/edit', verifyToken, UserController.updateUser);


module.exports = router;

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.delete('/:id', UserController.deleteUser);

module.exports = router;

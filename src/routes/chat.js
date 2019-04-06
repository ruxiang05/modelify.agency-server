/* Chat routes, uses express methods */
const express = require('express');
const { verifyToken } = require('../middleware');

const router = express.Router();
const ChatController = require('../controllers/chat');

router.get('/', verifyToken, ChatController.getChats);
router.get('/getMessages', verifyToken, ChatController.getMessages);

module.exports = router;

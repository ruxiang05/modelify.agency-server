const express = require('express');
const { verifyToken } = require('../middleware');

const router = express.Router();
const GoogleCalendar = require('../services/google-calendar');

router.post('/authorize', verifyToken, GoogleCalendar.authorize);
router.get('/getAuthURL', verifyToken, GoogleCalendar.getAuthURL);
router.post('/addEvent', verifyToken, GoogleCalendar.addEvent);

module.exports = router;

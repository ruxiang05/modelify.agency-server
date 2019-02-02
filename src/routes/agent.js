const express = require('express');
const { verifyToken } = require('../middleware');

const router = express.Router();
const AgentController = require('../controllers/agent');

router.get('/', verifyToken, AgentController.getModels);
router.post('/add-model', verifyToken, AgentController.addModel);

module.exports = router;

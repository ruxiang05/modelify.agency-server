const express = require('express');
const UserRoutes = require('./user');
const JobRoutes = require('./job');
const AgentRoutes = require('./agent');

const router = express.Router();

router.use('/users', UserRoutes);
router.use('/jobs', JobRoutes);
router.use('/agent', AgentRoutes);

router.get('/', (req, res) => {
  res.status(200).json({ message: 'API IS UP!' });
});

module.exports = router;

const express = require('express');
const { verifyToken } = require('../middleware');

const router = express.Router();
const JobController = require('../controllers/job');

router.get('/all', verifyToken, JobController.getJobs);
router.post('/create', verifyToken, JobController.createJob);
router.put('/update', verifyToken, JobController.updateJob);
router.delete('/delete', verifyToken, JobController.deleteJob);

module.exports = router;
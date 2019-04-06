/* Job routes, uses express methods */
const express = require('express');
const { verifyToken } = require('../middleware');

const router = express.Router();
const JobController = require('../controllers/job');

router.get('/all', verifyToken, JobController.getJobs);
router.post('/create', verifyToken, JobController.createJob);
router.put('/update', verifyToken, JobController.updateJob);
router.put('/accept', verifyToken, JobController.acceptJob);
router.put('/complete', verifyToken, JobController.completeJob);
router.put('/decline', verifyToken, JobController.declineJob);
router.delete('/delete', verifyToken, JobController.deleteJob);

module.exports = router;

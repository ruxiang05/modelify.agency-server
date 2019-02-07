const mongoose = require('mongoose');
const Job = require('../models/job');
const User = require('../models/user');

const createJob = (req, res) => {
  const { model: modelEmail, ...jobDetails } = req.body;
  const agent = req.user;
  if (modelEmail && agent) {
    User.findOne({ email: modelEmail })
      .exec()
      .then((model) => {
        const newJob = new Job({
          _id: new mongoose.Types.ObjectId(),
          model: model.id,
          agent: agent.id,
          ...jobDetails,
        });
        newJob
          .save()
          .then(savedJob => res.status(200).json({ message: 'Job created', job: savedJob }))
          .catch(() => res.status(500).json({ error: 'Could not create job' }));
      });
  } else {
    return res.status(400).json({ error: 'Model or agent non-existent' });
  }
};

const getJobs = (req, res) => {
  const { user } = req;
  if (user) {
    Job.find({ [`${user.role}`]: user.id }, (err, jobs) => {
      if (err) return res.status(400).json({ error: 'Could not find jobs' });
      return res.status(200).json({ message: 'Jobs found', jobs });
    });
  } else {
    return res.status(400).json({ error: 'No user provided' });
  }
};

const updateJob = (req, res) => {
  const job = req.body;
  Job.findByIdAndUpdate(job.id, job, { new: true }, (err, updatedJob) => {
    if (err) return res.status(400).json({ error: 'Could not update job' });
    return res.status(200).json({ message: 'Job updated', job: updatedJob });
  });
};

const deleteJob = (req, res) => {
  const { id, agent } = req.body;
  Job.findOneAndDelete({ _id: id, agent }, (err) => {
    if (err) res.status(400).json({ error: 'Could not delete job' });
    return res.status(200).json({ message: 'Job deleted' });
  });
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
};

/* Job controller, uses moongoose methods */
const mongoose = require('mongoose');
const Job = require('../models/job');
const User = require('../models/user');
const chatController = require('./chat');

const createJob = (req, res) => {
  const { model: modelEmail, ...jobDetails } = req.body;
  const agent = req.user;
  if (modelEmail) {
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
          .then(async (savedJob) => {
            // Create chat for the job
            await chatController.createChat(savedJob);
            return res.status(200).json({ message: 'Job created', job: savedJob });
          })
          .catch(() => res.status(500).json({ error: 'Could not create job, check fields' }));
      });
  } else {
    return res.status(400).json({ error: 'Model email not provided' });
  }
};

const getJobs = (req, res) => {
  const { user } = req;
  Job.find({ [`${user.role}`]: user.id }, null, { sort: { date: 'desc' } })
    .then(jobs => res.status(200).json({ message: 'Jobs found', jobs }))
    .catch(() => res.status(500).json({ error: 'Could not find jobs' }));
};

const updateJob = (req, res) => {
  const job = req.body;
  Job.findOneAndUpdate({ _id: job.id }, job, { new: true })
    .then(updatedJob => res.status(200).json({ message: 'Job updated', job: updatedJob }))
    .catch(() => res.status(500).json({ error: 'Could not update job' }));
};

const acceptJob = (req, res) => {
  const job = req.body;
  Job.findOneAndUpdate({ _id: job.id }, { status: 'in progress' }, { new: true })
    .then(updatedJob => res.status(200).json({ message: 'Job accepted', job: updatedJob }))
    .catch(() => res.status(500).json({ error: 'Could not accept job' }));
};

const completeJob = (req, res) => {
  const job = req.body;
  Job.findOneAndUpdate({ _id: job.id }, { status: 'complete' }, { new: true })
    .then(updatedJob => res.status(200).json({ message: 'Job completed', job: updatedJob }))
    .catch(() => res.status(500).json({ error: 'Could not complete job' }));
};

const declineJob = (req, res) => {
  const job = req.body;
  Job.findOneAndUpdate({ _id: job.id }, { status: 'declined' }, { new: true })
    .then(updatedJob => res.status(200).json({ message: 'Job declined', job: updatedJob }))
    .catch(() => res.status(500).json({ error: 'Could not decline job' }));
};

const deleteJob = (req, res) => {
  const job = req.body;
  Job.findOneAndDelete({ _id: job.id })
    .then(() => res.status(200).json({ message: 'Job deleted' }))
    .catch(() => res.status(500).json({ error: 'Could not delete job' }));
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  acceptJob,
  completeJob,
  declineJob,
  deleteJob,
};

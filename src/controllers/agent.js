const User = require('../models/user');

const addModel = (req, res) => {
  const { model } = req.body;
  const agent = req.user;

  if (!model) return res.status(500).json({ error: 'Model not provided' });

  User.findOne({ email: model })
    .then((foundModel) => {
      if (!foundModel) return res.status(500).json({ error: 'Model not in database' });
      User.findById(agent.id, '-password').then((foundAgent) => {
        if (foundAgent.agentInfo.models.indexOf(foundModel.id) === -1) {
          foundAgent.agentInfo.models.push(foundModel.id);
          foundAgent.save();
        } else {
          return res.status(401).json({ error: 'Model already linked' });
        }
        return res.status(200).json({ message: 'Model added', agent: foundAgent });
      });
    });
};

const getModels = (req, res) => {
  const agent = req.user;
  User.findOne({ _id: agent.id }, '-password -__v').populate('agentInfo.models', '-password -__v').exec()
    .then(foundAgent => res.status(200).json({ message: 'Retrieved all models', agent: foundAgent }));
};

module.exports = {
  addModel,
  getModels,
};

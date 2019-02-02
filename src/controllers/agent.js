const User = require('../models/user');

const addModel = (req, res) => {
  const { model } = req.body;
  const agent = req.user;

  if (model && agent) {
    User.findOne({ email: model })
      .exec()
      .then((foundModel) => {
        User.findById(agent.id, '-password', (err, foundAgent) => {
          if (err) return res.status(401).json({ error: 'Could not find agent' });
          if (!foundAgent.agentInfo.models.indexOf(foundModel.id) === -1) {
            foundAgent.agentInfo.models.push(foundModel.id);
            foundAgent.save();
          } else {
            return res.status(401).json({ error: 'Model already linked' });
          }
          return res.status(200).json({ message: 'Model added', agent: foundAgent });
        });
      }).catch(() => res.status(500).json({ error: 'Model not in database' }));
  } else {
    return res.status(500).json({ error: 'Model or agent non-existent' });
  }
};

const getModels = (req, res) => {
  const agent = req.user;

  if (agent) {
    User.findById(agent.id, '-password -__v').populate('agentInfo.models', '-password -__v').exec()
      .then(foundAgent => res.status(500).json({ message: 'Retrieved all models', agent: foundAgent }));
  } else {
    return res.status(500).json({ error: 'Agent non-existent' });
  }
};

module.exports = {
  addModel,
  getModels,
};

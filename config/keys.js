/* Produce keys depending on environment */
/* eslint-disable */ 
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./env/prod');
} else if (process.env.NODE_ENV === 'test') {
  module.exports = require('./env/test');
} else {
  module.exports = require('./env/dev');
}

const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const router = require('./routes/index.js');
const keys = require('../config/keys');

const PORT = process.env.PORT || 5656;

// Connect to hosted database
mongoose.connect(
  keys.MONGODB_URI,
  { useNewUrlParser: true, useCreateIndex: true },
);
const db = mongoose.connection;

/* eslint-disable no-console */
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enable cors
app.use(cors());

// Use routes
app.use(router);

io.on('connection', (socket) => {
  console.log(socket.id);
});

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  } else {
    console.log(`Server running on port: ${PORT}`);
  }
});

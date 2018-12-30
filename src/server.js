const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes/index.js');
const keys = require('../config/keys');

const app = express();
const PORT = process.env.PORT || 5656;

// Connect to hosted database
mongoose.connect(
  keys.MONGODB_URI,
  { useNewUrlParser: true, useCreateIndex: true },
);
const db = mongoose.connection;

/* eslint-disable no-console */
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Use routes
app.use(router);


app.listen(PORT, (err) => {
  if (err) {
    throw err;
  } else {
    console.log(`Server running on port: ${PORT}`);
  }
});

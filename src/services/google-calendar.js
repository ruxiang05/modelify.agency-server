const { google } = require('googleapis');
const User = require('../models/user');

const getCredentials = () => ({
  web: {
    client_id:
      '751247342935-439gbpm52ojb3ed8eicmjds76b11na8u.apps.googleusercontent.com',
    project_id: 'modelify-agency',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: '9P17FwLtxCiNm1uQ_-0HKU0t',
    javascript_origins: ['https://modelify.agency'],
    redirect_uris: ['https://modelify.agency/profile'],
  },
});

const scopes = ['https://www.googleapis.com/auth/calendar.events'];

/* eslint-disable camelcase */
const getAuthURL = (req, res) => {
  const { user } = req;

  if (user) {
    const { client_secret, client_id, redirect_uris } = getCredentials().web;
    if (!client_secret || !client_id || !redirect_uris) {
      res.status(500).json({ error: 'Credentials missing' });
    }

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.status(200).json({ redirect: url });
  } else {
    return res.status(401).json({ error: 'User not provided' });
  }
};

const authorize = (req, res) => {
  const { user } = req;
  const { code } = req.body;
  if (user) {
    if (!code) { res.status(400).json({ error: 'Code missing' }); }

    const { client_secret, client_id, redirect_uris } = getCredentials().web;
    if (!client_secret || !client_id || !redirect_uris) { res.status(500).json({ error: 'Credentials missing' }); }

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'Access granted', token });
    });
  } else {
    return res.status(401).json({ error: 'User not provided' });
  }
};

const addEvent = (req, res) => {
  const { client_secret, client_id, redirect_uris } = getCredentials().web;
  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const calendar = google.calendar({ version: 'v3', auth });
  const { user, body } = req;
  const {
    title, date, address, notes, _id,
  } = body;
  const formattedDate = new Date(date).toISOString().split('T')[0];
  if (user) {
    User.findOne({ _id: user._id }, (err, foundUser) => {
      if (err) {
        res.status(500).json({ error: 'User not found' });
      }
      auth.setCredentials(foundUser.googleCalendarAPIToken);
      const event = {
        id: _id,
        summary: title,
        location: address,
        description: notes,
        start: {
          date: formattedDate,
        },
        end: {
          date: formattedDate,
        },
      };

      calendar.events.insert({
        auth,
        calendarId: 'primary',
        resource: event,
      }, (error) => {
        if (error) {
          console.log(error); // eslint-disable-line
          return;
        }
        res.status(200).json({ message: 'Event added to calendar' });
      });
    });
  } else {
    return res.status(401).json({ error: 'User not provided' });
  }
};

module.exports = {
  authorize,
  getAuthURL,
  addEvent,
};

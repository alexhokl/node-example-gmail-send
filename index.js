const express = require('express');
const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const bodyParser = require('body-parser');
const mailMessage = require('./mail-message');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const SCOPES = ['https://mail.google.com/'];
const TOKEN_DIR = `${process.env.HOME}/.credentials/`;
const TOKEN_PATH = `${TOKEN_DIR}gmail-nodejs-quickstart.json`;
const PORT = 3001;

function authorize(credentials, callback, request, response, pdfContent) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback, request, response, pdfContent);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, request, response, pdfContent);
    }
  });
}

function getNewToken(oauth2Client, callback, request, response, pdfContent) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client, request, response, pdfContent);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
}

function listLabels(auth, req, res, attachments) {
  const encodedMessage = mailMessage.getEncodedMessage(
    req.body.to, req.body.from, req.body.subject, req.body.message, attachments);

  const gmail = google.gmail('v1');
  gmail.users.messages.send({
    auth,
    userId: 'me',
    resource: {
      raw: encodedMessage,
    },
  }, (err, response) => {
    if (err) {
      console.log(`The API returned an error: ${err}`);
      return;
    }
    const message = attachments.length > 0 ? 'Mail with attachment sent.' : 'Mail sent';
    res.status(200).send(message);
  });
}

app.post('/message', (req, res) => {
  fs.readFile('client_secret.json', (err, content) => {
    if (err) {
      console.log(`Error loading client secret file: ${err}`);
      return;
    }

    const attachments = [];
    if (!!req.body.attachments) {
      req.body.attachments.forEach(a => {
        attachments.push({
          bytes: fs.readFileSync(a.localFilename),
          contentType: a.contentType,
          filename: a.filename,
          encoding: a.encoding,
        });
      });
    }

    authorize(JSON.parse(content), listLabels, req, res, attachments);
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

This runs on Node version 5.x.

To try this example, clone this repository and download client secret from [Google API Console](https://console.developers.google.com/) (from credentials tab, click the credential of application type `Other`). Rename the json file to `client_secret.json` and put it in the project directory.

When this application first runs, an URL will be presented in console. Copy and paste the URL into a browser and follow the instructions for authorisation. Note that the account signed-in will be used to send the mails. At the end of the screen flow, you will be presented with an authorisation code. Copy and paste the code into the console window to continue.

After authorisation, the refresh and access tokens are stored in `~/.credentials/gmail-nodejs-quickstart.json`.

To send a mail, make a POST request to `http://localhost:3001/message` with the following body.
```
{
    "to": "alex@gmail.com",
    "from": "alex@gmail.com",
    "subject": "testing using Google APIs",
    "message": "This is a <i>testing</i> message."
}
```

To send a mail with an attachment, put a copy of PDF file in the project directory and name the file as `attachment.pdf`. Then, make a POST request to `http://localhost:3001/message` with the following body.
```
{
    "to": "alex@gmail.com",
    "from": "alex@gmail.com",
    "subject": "testing using Google APIs",
    "message": "This is a <i>testing</i> message.",
    "attachments": [{
       "localFilename": "attachment.pdf",
       "filename": "form.pdf",
       "contentType": "application/pdf",
       "encoding": "utf8"
    }]
}
```

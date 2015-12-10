var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var request = require('request');
var sync = require('synchronize');
var apikey = require('./apikey.js');
var fs = require('fs');

var contacts = {
  test1: {
    id: 'test1',
    name: 'Test User 1',
    email: 'test1@example.com'
  },
  test2: {
    id: 'test2',
    name: 'Test User 2',
    email: 'test2@example.com'
  }
};

function getLambdaURL() {
  var config;
  if (process.env.NODE_ENV === 'heroku') {
    config = JSON.parse(process.env.LAMBDA_CONFIG);
  } else {
    config = JSON.parse(fs.readFileSync('./lambda.json', 'utf-8'));
  }
  return config.url;
}

var lambdaURL;

function requestGlobalContactID() {
  if (!lambdaURL) {
    lambdaURL = getLambdaURL();
  }

  var opts = {
    url: lambdaURL,
    json: true,
  };
  return sync.await(request.get(opts, sync.defer()));
}

function generateGlobalContactID() {
  // TODO: Implement retry for requestGlobalContactID
}

var contactID = 1;

function generateLocalContactID() {
  return contactID++;
}

function getContact(id) {
  if (!contacts[id]) {
    return null;
  }
  
  return contacts[id];
}

function createContact(req) {
  // input validation
  if (typeof req.body.name !== "string" || typeof req.body.email !== "string") {
    return null;
  }
  
  // create a new contact
  var id = generateLocalContactID();
  var contact = {
    id: id,
    name: req.body.name,
    email: req.body.email
  };
  
  // add to the global container
  contacts[id] = contact;
  
  return contact;
}

function deleteContact(id) {
  if (!contacts[id]) {
    return null;
  }
  delete contacts[id];
  return {};
}

var app = module.exports = express();

app.set('port', (process.env.PORT || 5000));

app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({
  extended: true
}));

app.use('/api/*', apikey.verify({
  APIKEY1: 'secure_api_key'
}));

app.use(function (req, res, next) {
  sync.fiber(next);
});

app.get('/contacts/:id', function (req, res) {
  if (req.params.id.match(/[^0-9a-zA-Z\-]+/)) {
    res.send('invalid contact id');
    return;
  }

  res.sendFile(__dirname + '/public/contact.html');
});

app.get('/api/1/test', function (req, res) {
  res.json({
    message: 'api test succeeded'
  });
});

app.get('/api/1/contacts', function (req, res) {
  var result = {
    contacts: []
  };
  for (var key in contacts) {
    result.contacts.push(contacts[key]);
  }

  res.json({
    contacts: contacts
  });
});

app.get('/api/1/contacts/:id', function (req, res) {
  var result = getContact(req.params.id);
  
  if (!result) {
    res.status(404).json({
      error: 'user id not found'
    });
    return;
  }
  
  res.json({
    contacts : result
  })
});

app.post('/api/1/contacts', function (req, res) {
  var contact = createContact(req);
  
  if (!contact) {
    res.status(503).json({
      error: 'cannot create contact'
    });
    return;
  }
  
  res.status(201).json(contact);
});

app.delete('/api/1/contacts/:id', function (req, res) {
  var result = deleteContact(req.params.id);
  if (!result) {
    res.status(404).json({
      error: 'cannot delete the contact'
    });
    return;
  }

  res.status(204).send();
});

app.put('/api/1/contacts/:id', function (req, res) {
  var id = req.params.id;

  // example of input validation
  if (typeof id !== "string") {
    res.status(400).json({
      error: 'invalid id'
    });
    return;
  }
  if (typeof req.body.name !== "string") {
    res.status(400).json({
      error: 'invalid name'
    });
    return;
  }
  if (typeof req.body.email !== "string") {
    res.status(400).json({
      error: 'invalid email'
    });
    return;
  }

  var result = deleteContact(id);
  if (!result) {
    res.status(404).json({
      error: 'cannot update the contact'
    });
    return;
  }

  var contact = {
    id: id,
    name: req.body.name,
    email: req.body.email
  };
  contacts[id] = contact;

  res.status(200).json(contact);
});

if (!module.parent) {
  app.listen(app.get('port'), function () {
    console.log('node app is running at localhost:' + app.get('port'));
  });
}

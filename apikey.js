var crypto = require('crypto');

function calcHMAC(url, method, body, nonce, key) {
  // TODO: Create HMAC signature by using crypto
}

function sendAuthError(res) {
  res.status(401).json({
    error: 'authentication required'
  });
}

function verify(apiKeys) {
  return function (req, res, next) {
    var method = req.method;
    var body, hmac;

    if (Object.keys(req.body).length) {
      body = JSON.stringify(req.body);
    } else {
      body = '';
    }

    // TODO: Create signature and compare with the signature from client

    next();
  };
}

exports.verify = verify;

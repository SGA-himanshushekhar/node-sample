var crypto = require('crypto');

function calcHMAC(url, method, body, nonce, key) {
  var algorithm = 'sha256';
  var data = url + method.toUpperCase() + body + nonce;
  return crypto.createHmac(algorithm, key).update(data).digest('hex');
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
    
    // get signature, nonce from header
    var signature = req.headers['x-api-sign'];
    var nonce = req.headers['x-api-nonce'];
    var apiKeyId = req.headers['x-api-key'];
    
    if (!signature || !nonce || !apiKeyId) {
      console.log("auth failed: missing signature");
      sendAuthError(res);
      return;
    }

    // Create signature and compare with the signature from client
    hmac = calcHMAC(req.originalUrl, method, body, nonce, apiKeys[apiKeyId]);
    
    if (signature === hmac) {
      // signature verified; proceed
      next();
    } else {
      // signature invalid; return error
      console.log("auth failed: sign[" + signature + "], nonce[" + nonce + "]");
      sendAuthError(res);
    }
  };
}

exports.verify = verify;

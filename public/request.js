// Set API_KEY here
var API_KEY_SECRET = 'secure_api_key';
var API_KEY_ID = 'APIKEY1';

function calcHMAC(url, method, body, nonce, key) {
  var sign = new jsSHA('SHA-256', 'TEXT');
  sign.setHMACKey(key, 'TEXT');
  sign.update(nonce + url + method.toUpperCase() + body);
  return sign.getHMAC('HEX');
}

function request(url, method, data, onSuccess, onFailure) {
  var nonce = $.now();
  var signature = calcHMAC(url, method, data, nonce, API_KEY_SECRET);

  $.ajax({
    url: url,
    type: method,
    data: data,
    contentType: 'application/json',
    dataType: 'text',
    timeout: 10000,
    headers: {
      'X-API-Key': API_KEY_ID,
      'X-API-Nonce': nonce,
      'X-API-Sign': signature
    }
  }).done(onSuccess).fail(onFailure);
}

function onFailure(xhr, status, err) {
  alert('api call failed: [' + status + '] ' + err);
}

function getContacts(onSuccess) {
  var url = '/api/1/contacts';
  var method = 'GET';
  request(url, method, '', onSuccess, onFailure);
}

function addContact(dataObj, onSuccess) {
  var url = '/api/1/contacts';
  var method = 'POST';
  var data = JSON.stringify(dataObj);
  request(url, method, data, onSuccess, onFailure);
}

function deleteContact(id, onSuccess) {
  var url = '/api/1/contacts/' + id;
  var method = 'DELETE';
  request(url, method, '', onSuccess, onFailure);
}

function getContact(id, onSuccess) {
  var url = '/api/1/contacts/' + id;
  var method = 'GET';
  request(url, method, '', onSuccess, onFailure);
}

function updateContact(id, dataObj, onSuccess) {
  var url = '/api/1/contacts/' + id;
  var method = 'PUT';
  var body = JSON.stringify(dataObj);
  request(url, method, body, onSuccess, onFailure);
}

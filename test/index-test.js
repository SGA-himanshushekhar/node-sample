require('should');
var request = require('supertest');
var index = require('../index');
var crypto = require('crypto');

var DEFAULT_API_KEY_SECRET = 'secure_api_key';
var DEFAULT_API_KEY_ID = 'APIKEY1';

function getApiKeySecret() {
    if(process.env.API_KEY_SECRET) { 
        return process.env.API_KEY_SECRET;
    } else { 
        return DEFAULT_API_KEY_SECRET;
    }
}

function getApiKeyId() {
    if(process.env.API_KEY_ID) { 
        return process.env.API_KEY_ID;
    } else { 
        return DEFAULT_API_KEY_ID;
    }
}

function getSignature(url, method, body, nonce) {
    var algorithm = 'sha256';
    var key = getApiKeySecret();
    var data = url + method.toUpperCase() + body + nonce;
    
    return crypto.createHmac(algorithm, key).update(data).digest('hex');
}

function getAuthHeaders(url, method, body) {
    var nonce = (new Date).getTime();
    var id = getApiKeyId();
     
    var signature = getSignature(url, method, body, nonce);
    
    var headers = {
        'X-API-Key': id,
        'X-API-Nonce': nonce,
        'X-API-Sign': signature
    };
    return headers;
}

describe('create and get a contact', function () {
    var id;
    var contact_data = {
        "name": "test name",
        "email": "test email"
    };

    it('should create a contact', function (done) {
        request(index)
            .post("/api/1/contacts")
            .set(getAuthHeaders("/api/1/contacts", 'POST', JSON.stringify(contact_data)))
            .send(contact_data)
            .expect(201)
            .end(function (err, res) {
                if (err) throw err;
                id = res.body.id;
                done();
            });
    });
    
    it('should get a contact', function (done) {
        request(index)
            .get("/api/1/contacts/" + id)
            .set(getAuthHeaders(("/api/1/contacts/" + id), 'GET', ''))
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                res.body.contact.id.should.equal(id);
                res.body.contact.email.should.equal(contact_data.email);
                res.body.contact.name.should.equal(contact_data.name);
                done();
            });
    });
});

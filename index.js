#!/usr/bin/env node

var Q = require('q');
var fs = require('fs');
var path = require('path');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('lodash');

var Api = function() {
  this.token = '';
};

Api.prototype = {
  login: function() {
    var deferred = Q.defer();

    fs.readFile(path.join(__dirname, 'requests', 'login.xml'), 'utf-8', function(err, data) {
      if (err) { return deferred.reject(err); }

      var url = 'http://api.opensubtitles.org/xml-rpc';
      request.post({ url: url, body: data }, function(err, response, body) {
        if (err) { return deferred.reject(err); }

        var parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(body, function(err, xml) {
          var getParam = function(name) {
            var params = xml.methodResponse.params.param.value.struct.member;
            return _.find(params, { name: name }).value.string;
          };

          var status = getParam('status');

          if (status === '200 OK') {
            var token = getParam('token');
            deferred.resolve(token);
          } else {
            deferred.reject(status);
          }
        });
      });

    });

    return deferred.promise.then(function(token) {
      this.token = token;
      return token;
    }.bind(this));
  }
};

var api = new Api();

console.log('Trying to login into opensubtitles API...');
api.login().then(function(token) {
  console.log('opensubtitles API Login with token', api.token);
});

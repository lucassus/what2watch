#!/usr/bin/env node

var Q = require('q');
var fs = require('fs');
var path = require('path');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('lodash');

var MethodResponse = function(xml) {
  this.xml = xml;
};

MethodResponse.prototype = {
  getParam: function(name) {
    var params = this.xml.methodResponse.params.param.value.struct.member;
    var value = _.find(params, { name: name }).value.string;

    return value;
  }
};

var Api = function() {
  this.apiUrl = 'http://api.opensubtitles.org/xml-rpc';
  this.token = null;
};

Api.prototype = {
  request: function(method, params) {
    if (params === undefined) { params = {}; }
    if (this.token) { _.extend(params, { token: this.token }); }

    var deferred = Q.defer();

    fs.readFile(path.join(__dirname, 'requests', method + '.xml'), 'utf-8', function(err, xmlTemplate) {
      if (err) { return deferred.reject(err); }

      var xmlRequest = _.template(xmlTemplate)(params);

      request.post({ url: this.apiUrl, body: xmlRequest }, function(err, response, body) {
        if (err) { return deferred.reject(err); }

        var parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(body, function(err, xml) {
          if (err) { return deferred.reject(err); }

          var methodResponse = new MethodResponse(xml);
          var status = methodResponse.getParam('status');

          if (status === '200 OK') {
            deferred.resolve(methodResponse);
          } else {
            deferred.reject(status);
          }
        }.bind(this));
      }.bind(this));
    }.bind(this));

    return deferred.promise;
  },

  login: function() {
    var deferred = Q.defer();

    this.request('login').then(function(methodResponse) {
      var token = methodResponse.getParam('token');
      deferred.resolve(token);
    }, function(err) {
      deferred.reject(err);
    });

    return deferred.promise.then(function(token) {
      this.token = token;
      return token;
    }.bind(this));
  },

  search: function(query) {
    var deferred = Q.defer();

    this.request('search', { lang: 'eng', query: query }).then(function(methodResponse) {
      deferred.resolve(methodResponse);
    });

    return deferred.promise;
  }
};

var api = new Api();

console.log('Trying to login into opensubtitles API...');
api.login().then(function(token) {
  console.log('opensubtitles API Login with token', api.token);

  var args = process.argv.slice(2);
  return api.search(args[0]);
}).then(function(methodResponse) {
  var xml = methodResponse.xml;
  var params = xml.methodResponse.params.param.value.struct.member;
  var results = _.findWhere(params, { name: 'data' }).value.array.data.value;

  var movie = _.reduce(results[0].struct.member, function(result, field) {
    result[field.name] = field.value.string;
    return result;
  }, {});

  return _.pick(movie, 'IDMovieImdb', 'MovieName', 'MovieYear', 'MovieImdbRating');
}).then(function(movie) {
  console.log('\n--- movie brief info:\n', movie);
  return movie;
}).then(function(movie) {
  var deferred = Q.defer();

  request.get('http://www.omdbapi.com/?i=' + 'tt0' + movie['IDMovieImdb'], { json: true }, function(err, body, body) {
    if (err) { return deferred.reject(err); }
    deferred.resolve(body);
  });

  return deferred.promise;
}).then(function(movie) {
  console.log('\n--- movie details:\n', movie);
}).catch(function(err) {
  console.log('error:', err);
});

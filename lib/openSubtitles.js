var fs = require('fs');
var path = require('path');
var Q = require('q');
var _ = require('lodash');
var request = require('request');
var xml2js = require('xml2js');

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

var OpenSubtitles = function() {
  this.apiUrl = 'http://api.opensubtitles.org/xml-rpc';
  this.token = null;
};

OpenSubtitles.prototype = {
  request: function(method, params) {
    if (params === undefined) { params = {}; }
    if (this.token) { _.extend(params, { token: this.token }); }

    var deferred = Q.defer();

    fs.readFile(path.join(__dirname, '../requests', method + '.xml'), 'utf-8', function(err, xmlTemplate) {
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
  },

  searchFile: function(path) {
    var deferred = Q.defer();

    Q.all([fileHash(path), fileSize(path)]).then(function(data) {
      var params = {
        lang: 'eng',
        moviehash: data[0],
        moviebytesize: data[1]
      };
      this.request('searchFile', params).then(function(methodResponse) {
        deferred.resolve(methodResponse);
      });
    }.bind(this));

    return deferred.promise;
  },

  checkMovieHash: function(movie) {
    var deferred = Q.defer();

    this.request('checkMovieHash', { hash: movie.hash }).then(function(methodResponse) {
      var data = _.find(methodResponse.xml.methodResponse.params.param.value.struct.member, { name: 'data' });

      if (data.value.struct.member.value && data.value.struct.member.value.struct) {
        deferred.resolve(data.value.struct.member.value.struct.member);
      } else {
        deferred.reject(data);
      }

    }).done();

    return deferred.promise;
  },

  getIMDBMovieDetails: function(imdbId) {
    var deferred = Q.defer();

    this.request('getIMDBMovieDetails', { id: imdbId }).then(function(methodResponse) {
      var data = _.find(methodResponse.xml.methodResponse.params.param.value.struct.member, { name: 'data' });

      if (data.value.struct.member.value && data.value.struct.member.value.struct) {
        deferred.resolve(data.value.struct.member.value.struct.member);
      } else {
        deferred.reject(data);
      }

    }).done();

    return deferred.promise;
  }
};

module.exports = OpenSubtitles;

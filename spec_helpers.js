var path = require('path');

module.exports = {

  fixturePath: function(name) {
    return path.resolve(__dirname, 'spec_fixtures', name);
  }

};

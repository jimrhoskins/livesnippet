var rest = require('restler');
var fs = require('fs');

var LiveSnippet = rest.service(function (host) {
  if (!host.match(/:\/\//)) {
    host = "http://" + host;
  }

  this.baseURL = host;
  this.channel = null;
}, null, {
  createChannel: function (callback) {
    var service = this;

    this.post('/snippets', {
      test: 'foo'
    }).on('success', function (response) {
      console.log(response);
      service.path = response.path;
      service.channel = response.channel;
    }).on('error', function (error) {
      callback(error);
    });
  },

  updateFile: function (filename, callback) {
    var service = this;
    fs.readFile(filename, function (err, data) {
      console.log(data.toString());
      service.post(service.path, {
        headers: { 'Content-Type': 'text/plain' },
        data: data.toString(),
        query: { name: filename }
      });
    });
  }
});

exports.LiveSnippet = LiveSnippet;

var rest = require('restler');
var fs = require('fs');

var LiveSnippet = rest.service(function (host, channel) {
  if (!host.match(/:\/\//)) {
    host = "http://" + host;
  }

  this.baseURL = host;
  this.channel = channel;
}, null, {
  createChannel: function (callback) {
    var service = this;

    var query = this.channel ? {channel: this.channel} : null;
    
    this.post('/snippets', {
      query: query
    }).on('success', function (response) {
      console.log(response);
      service.path = response.path;
      service.channel = response.channel;

      callback(null, service);
    }).on('error', function (error) {
      callback(error);
    });
  },

  updateFile: function (filename, callback) {
    var service = this;
    fs.readFile(filename, function (err, data) {
      service.post(service.path, {
        headers: { 'Content-Type': 'text/plain' },
        data: data.toString(),
        query: { name: filename }
      });
    });
  }
});

exports.LiveSnippet = LiveSnippet;

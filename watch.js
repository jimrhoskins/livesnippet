// Require
var fs = require('fs');
var http = require('http');

// Filename to watch at 2
// Example: node watch.js foo.txt
// file will be absolute path string
var file = process.argv[2];

// Location of server
// TODO Make this an environment or argument variable
var HOST = "localhost";
var PORT = 3000;

// Create a new snippet for this file
// TODO Implement the ability to pass an existing snippet channel name
function createSnippet(callback) {
  // POST to /snippets to create new snippet channel
  var req = http.request({
    host: HOST,
    port: PORT,
    method: 'POST',
    path: '/snippets'
  }, function (res) {
    
    // Load body text
    var body = [];

    res.on('data', function (chunk) {
      body.push(chunk);
    });

    // Parse body, and exec callback with response
    res.on('end', function () {
      var bodyString = body.join('');
      try {
        var object = JSON.parse(bodyString);
        callback(null, object);
      } catch (e) {
        callback('JSON Parsing Error');
      }
    });

  });

  // If an error occurs, pass error to callback
  req.on('error', function (e) {
    callback(e.message);
  });

  // send request
  req.end();
}


// Update the current snippet channel with file contents
// TODO add dynamic channel
function updateSnippet(){
  var req = http.request({
    host: HOST,
    port: PORT,
    method: 'POST',
    path: '/snippets/foo' // TODO Change to dynamic
  });

  // Read file, and send it through request
  fs.readFile(file, function (err, data) {
    req.write(data);
    req.end();
  });



};


// Do it!

// Initialize new snippet
// TODO allow channel name ot passed
// TODO use assigned channel name
// TODO send filename
createSnippet(function (err, response) {
  console.log('snippet', err, response);
});


// Watch this file, and if it changes, update the snippet
// interval: 100 faster than default interval 0 (go figure)
fs.watchFile(file, {interval: 100}, function (curr, prev) {

  if (curr.mtime > prev.mtime) {
    updateSnippet();
  }

});

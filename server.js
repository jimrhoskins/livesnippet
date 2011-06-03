var express = require('express');
var io  = require('socket.io');
var Snippet = require('./lib/snippet').Snippet;

// Initialize HTTP Server, Socket, and Snippet database
var app = express.createServer();
var socket = io.listen(app);
var snippets = {};

// Utlitity to concat a stream into a string
function concat(stream, callback) {
  var data = [];
  stream.on('data', function (chunk) {
    data.push(chunk);
  });

  stream.on('end', function () {
    callback(null, data.join(''));
  });
}


// Configure views and public directory
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.use(express.static(__dirname + '/public'));
});

// Endpoint for watch.js to create a new snippet
app.post('/snippets', function (req, res) {
  var snippet;
  //TODO add verification;
  if (req.query.channel) {
    if (snippets[req.query.channel]) {
      snippet = snippets[req.query.channel];
    } else {
      snippet = new Snippet(req.query.channel);
      snippets[snippet.name] = snippet;
    }
  } else {
    snippet = new Snippet();
    snippets[snippet.name] = snippet;
  }

  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify({
    channel: snippet.name,
    path: "/snippets/" + snippet.name
  }));
});

// Clients view of a snippet
app.get('/snippets/:channel', function (req, res) {
  res.render('snippet.jade', {layout: false, channel: req.params.channel});
});

// API for watch.js to update contents of snippet
app.post('/snippets/:channel', function (req, res) {
  concat(req, function (err, body) {
    res.send('OK');
    
    var channel = req.params.channel;
    var snippet = snippets[channel];
    var name = req.query.name;

    console.log('Updating...', channel, name);

    snippet.updateFile(name, body);

    console.log('Updated Snippet from POST');
  });
});

// Handle sockets
socket.on('connection', function (client) {
  var channel = null;
  var snippet = null;

  // Named listener for snippet updates (for easy removal on disconnect)
  function onSnippetUpdate(filename) {
    console.log('Snippet Update', filename);

    // Send the socket client the newest content
    var files = filename ? [filename] : null;
    client.send(snippet.repr(files));
    
  }


  client.on('message', function (data) {

    // If message contains existing channel, subscribe to that snippet's update (onSnippetUpdate)
    if (data.channel) {
      console.log('Attempting to subscribe to channel: ' + data.channel);
      if (channel === null) {
        channel = data.channel;
        if (snippets[channel]) {
          snippet = snippets[channel];
        } else {
          snippet = snippets[channel] = new Snippet(channel);
        }
        snippet.on('update', onSnippetUpdate);

        // Initialize the client with the current data
        onSnippetUpdate();
        console.log('Successfully subscribed to: ' + channel);
      } else {
        console.log('Subscription failed, already subscribed: ' + channel);
      }
    }
  });


  // On disconnect, remove client's update listener for the snippet
  client.on('disconnect', function () {
    if (snippet) {
      snippet.removeListener('update', onSnippetUpdate);
    }

    console.log('Client Disconnected');
  
  });
});

// HTTP Server listen
app.listen(process.env.PORT || 3000);

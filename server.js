var express = require('express');
var io  = require('socket.io');
var Snippet = require('./lib/snippet').Snippet;

// Initialize HTTP Server, Socket, and Snippet database
var app = express.createServer();
var socket = io.listen(app);
var snippets = {};

// TODO Remove initializeation of foo
snippets.foo = new Snippet();

// Configure views and public directory
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.use(express.static(__dirname + '/public'));
});

// Endpoint for watch.js to create a new snippet
app.post('/snippets', function (req, res) {
  var channel  = "foo";
  snippets[channel] = new Snippet();
  res.send(JSON.stringify({
    ok: 200,
    channel: channel,
    path: "/snippets/" + channel
  }));
});

// Clients view of a snippet
app.get('/snippets/:channel', function (req, res) {
  res.render('snippet.jade', {layout: false});
});

// API for watch.js to update contents of snippet
app.post('/snippets/:channel', function (req, res) {
  // Load all body data into data
  var data = [];

  req.on('data', function (chunk) {
    data.push(chunk);
  });

  // When body is read, create string, and update this snippet
  // TODO use :channel instead of foo
  req.on('end', function () {
    res.send('OK');
    snippets.foo.update(data.join(''));
    console.log('Updated Snippet from POST');
  });
});

// Handle sockets
socket.on('connection', function (client) {
  var channel = null;
  var snippet = null;

  // Named listener for snippet updates (for easy removal on disconnect)
  function onSnippetUpdate() {
    console.log('Snippet Update', snippet.data);

    // Send the socket client the newest content
    client.send({
      content: snippet.data
    });
  }


  client.on('message', function (data) {

    // If message contains existing channel, subscribe to that snippet's update (onSnippetUpdate)
    if (data.channel) {
      console.log('Attempting to subscribe to channel: ' + data.channel);
      if (channel === null) {
        channel = data.channel;
        if (snippets[channel]) {
          snippet = snippets[channel];
          snippet.on('update', onSnippetUpdate);

          // Initialize the client with the current data
          onSnippetUpdate();
          console.log('Successfully subscribed to: ' + channel);
        } else {
          console.log('Subscription failed, no such channel: ' + channel);
        }
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

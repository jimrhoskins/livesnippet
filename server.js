var express = require('express');

var Channel = require('./lib/channel').Channel;

// Initialize HTTP Server, Socket, and Channel database
var app = express.createServer();
var io = require('socket.io').listen(app);
var channels = {};

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
  var channel;

  //TODO add verification;
  if (req.query.channel) {
    if (channels[req.query.channel]) {
      channel = channels[req.query.channel];
    } else {
      channel = new Channel(req.query.channel);
      channels[channel.name] = channel;
    }
  } else {
    channel = new Channel();
    channels[channel.name] = channel;
  }

  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify({
    channel: channel.name,
    path: "/snippets/" + channel.name
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
    var channel = channels[channel];
    var name = req.query.name;

    console.log('Updating...', channel, name);

    channel.updateFile(name, body);

    console.log('Updated Snippet from POST');
  });
});

// Handle sockets
io.sockets.on('connection', function (socket) {
  var channel = null;

  // Named listener for snippet updates (for easy removal on disconnect)
  function onSnippetUpdate(filename) {
    console.log('Snippet Update', filename);

    // Send the socket client the newest content
    var files = filename ? [filename] : null;
    socket.emit('fileUpdate', channel.repr(files));
    
  }



  function getChannel(name){
    if (channels[name]) {
      return channels[name];
    }
    return (channels[name] = new Channel(name));
  }

  socket.on('subscribe', function(channelName) {
    channel= getChannel(channelName);
    channel.on('update', onSnippetUpdate);
    onSnippetUpdate();
  });

  
  // On disconnect, remove client's update listener for the snippet
  socket.on('disconnect', function () {
    if (channel) {
      channel.removeListener('update', onSnippetUpdate);
    }

    console.log('Client Disconnected');
  
  });
});


// HTTP Server listen
app.listen(process.env.PORT || 3000);

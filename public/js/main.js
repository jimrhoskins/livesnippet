var socket = new io.Socket();
socket.connect();


dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');

var tabs;
var snippets = {};
function getSnippet(filename) {
  if (snippets[filename]) {
    return snippets[filename];
  } else {
    snippets[filename] = new dijit.layout.ContentPane({
      title: filename,
      content: '....'
    });
    tabs.addChild(snippets[filename]);
    return snippets[filename];
  }
}


dojo.addOnLoad(function () {
  tabs = new dijit.layout.TabContainer({
    style: 'height: 100%; width: 100%'
  }, 'tabs');

  var welcome = new dijit.layout.ContentPane({
    title: "Welcome",
    content: "Hello World"
  });

  tabs.addChild(welcome);
  tabs.startup();



  socket.send({
    channel: CHANNEL || 'foo'
  });
});



socket.on('message', function (data) {
  console.log('Recieved', data);
  if (data.content) {
    for(var filename in data.content) {
      console.log(filename);
      var snippet = getSnippet(filename);
      snippet.setContent("<pre>" + data.content[filename].replace(/</g, '&lt;') + "</pre>");
    }
  }
});

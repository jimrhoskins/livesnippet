var socket = new io.Socket();
socket.connect();

//ddd:w
//

dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojox.highlight');
dojo.require('dojox.highlight.languages.javascript');

var modes = {};


var tabs;
var snippets = {};
function getSnippet(filename) {
  if (snippets[filename]) {
    return snippets[filename];
  } else {
    var pre = dojo.create('pre', {
      className: 'editor',
      innerHTML: '...'
    }, null);

    
    snippets[filename] = new dijit.layout.ContentPane({
      title: filename,
      content: pre
    });

    snippets[filename].pre = pre;
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



function addLines(pre) {
  var code = pre.innerHTML;
  var lines = code.split(/\r?\n/);
  lines = dojo.map(lines, function (line) {
    return "<li><span class='line'>" + line + "\n</span></li>";
  });
  pre.innerHTML = "<ol>" + lines.join("") + "</ol>";
}

socket.on('message', function (data) {
  console.log('Recieved', data);
  if (data.content) {
    for(var filename in data.content) {
      console.log(filename);
      var snippet = getSnippet(filename);
      //snippet.setContent("<pre>" + data.content[filename].replace(/</g, '&lt;') + "</pre>");
      var code = dojox.highlight.processString(data.content[filename]).result;
      snippet.pre.innerHTML = code;
      addLines(snippet.pre);
      //snippet.pre.innerHTML = data.content[filename].replace(/</g, '&lt;');
      //snippet.editor.getSession().setValue(data.content[filename]);
    }
  }
});

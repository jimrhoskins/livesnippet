var socket = io.connect('http://localhost');

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
    var index;
    var pre = dojo.create('pre', {
      className: 'editor',
      innerHTML: '...'
    }, null);

    
    snippets[filename] = new dijit.layout.ContentPane({
      title: filename,
      content: pre
    });

    var children = tabs.getChildren();
    index = children.length - 1;

   // index = 0;
    while(children[index] && filename < children[index].title) index -= 1
    //index = Math.max(0, index - 1);
    snippets[filename].pre = pre;
    console.log('idx', index)
    tabs.addChild(snippets[filename], index + 1 );
    return snippets[filename];
  }
}


dojo.addOnLoad(function () {
  tabs = new dijit.layout.TabContainer({
    style: 'height: 100%; width: 100%',
    tabPosition: 'left-h',
  }, 'tabs');

  var welcome = new dijit.layout.ContentPane({
    title: "Welcome",
    content: "Hello World"
  });

  tabs.addChild(welcome);
  tabs.startup();



  socket.emit('subscribe', CHANNEL || 'foo');
});



function addLines(pre) {
  var code = pre.innerHTML;
  var lines = code.split(/\r?\n/);
  lines = dojo.map(lines, function (line) {
    return "<li><span class='line'>" + line + "\n</span></li>";
  });
  pre.innerHTML = "<ol>" + lines.join("") + "</ol>";
}

socket.on('fileUpdate', function (files) {
  var filename;

  for(filename in files) { if (files.hasOwnProperty(filename)) {
    console.log(filename);
    var snippet = getSnippet(filename);

    var code = dojox.highlight.processString(files[filename]).result;
    snippet.pre.innerHTML = code;
    addLines(snippet.pre);
  }}
});

#!/usr/bin/env node
// 

var GlobWatcher = require('../lib/globwatch').GlobWatcher;
var LiveSnippet = require('../lib/livesnippet').LiveSnippet;
var argv = require('optimist')
    .usage('Usage $0 [pattern]')
    .alias('p', 'pattern')
    .describe('p', 'File pattern to watch')
    .alias('c', 'channel')
    .describe('c', 'Channel Name (optional)')
    .alias('u', 'url')
    .describe('u', 'Service URL')
    .default('url', 'localhost:3000')
    .argv
;



var watcher = new GlobWatcher();
var snippet = new LiveSnippet(argv.url, argv.channel);

snippet.createChannel(function () {
  console.log('Connected');

  console.log("==============================================");
  console.log("============== Connected =====================");
  console.log(snippet.baseURL+ snippet.path);
  console.log("==============================================");
  watcher.on('change', function (filename) {
    console.log('Change', filename);
    snippet.updateFile(filename);
  });


  watcher.touchAll();
});



if (argv.pattern) {
  console.log(argv.pattern);
  watcher.watchGlob(argv.pattern);
} else {
  watcher.watchFiles(argv._);
}


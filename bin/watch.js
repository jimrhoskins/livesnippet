#!/usr/bin/env node

var GlobWatcher = require('../lib/globwatch').GlobWatcher;
var LiveSnippet = require('../lib/livesnippet').LiveSnippet;
var argv = require('optimist')
.usage('Usage $0 [pattern]')
.alias('p', 'pattern')
.describe('p', 'File pattern to watch')
.argv
;



var watcher = new GlobWatcher();
var snippet = new LiveSnippet('localhost:3000');

snippet.createChannel(function () {});

watcher.on('change', function (filename) {
  snippet.updateFile(filename);
});


if (argv.pattern) {
  console.log(argv.pattern);
  watcher.watchGlob(argv.pattern);
} else {
  watcher.watchFiles(argv._);
}



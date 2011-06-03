var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var glob = require('glob').glob;
var _ = require('underscore');

function GlobWatcher() {
  EventEmitter.call(this);

  this.files = {};

}

GlobWatcher.prototype = _.extend(Object.create(EventEmitter.prototype), {
  watchGlob: function (pattern) {
    var watcher = this;

    glob(pattern, function (err, files) {
      if (!err) {
        watcher.watchFiles(files);
      }
    });
  },

  watchFiles: function (filenames) {
    filenames.forEach(this.watchFile.bind(this));
    
  },

  watchFile: function (filename) {
    var watcher = this;

    if (this.files[filename]) {
      console.log("- Already watching " + filename);
    } else {
      var watchFile = function (curr, prev) {
        if (curr.mtime.valueOf() !== prev.mtime.valueOf() || curr.ctime.valueOf() !== prev.ctime.valueOf()) {
          console.log('Change detected on ' + filename);
          watcher.emit('change', filename);
        }
      };

      watcher.files[filename] = watchFile;
      fs.watchFile(filename, {interval: 100}, watchFile);
      console.log('Watching File: ' + filename);
    }
  }
});

exports.GlobWatcher = GlobWatcher;

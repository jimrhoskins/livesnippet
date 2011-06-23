var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');

function randomName(){
  return Math.round(Math.random() * 10000).toString(16);
}

function Snippet(name){
  // Initialize self as event emitter
  EventEmitter.call(this);

  this.name = name || randomName();
  this.data = null;
  this.filenames = [];
  this.files = {};
}

// Make snippet descend from EventEmitter
Snippet.prototype = _.extend(Object.create(EventEmitter.prototype), {
  updateFile: function (filename, data) {
    if (-1 === this.filenames.indexOf(filename)) {
      this.filenames.push(filename);
      this.files[filename] = {name: filename, data:data};
    } else {
      this.files[filename].data = data;
    }

    this.emit('update', filename, this.files[filename]);

  }, 

  repr: function (filenames) {
    filenames = filenames || this.filenames;
    var content = {};
    
    filenames.forEach(function (filename) {
      content[filename] = this.files[filename].data;
    }.bind(this));

    return content;
  }
});

// Update the data, and trigger update event
Snippet.prototype.update = function (data) {
  this.data = data;
  this.emit('update');
};

// Export Snippet from module
exports.Snippet = Snippet;

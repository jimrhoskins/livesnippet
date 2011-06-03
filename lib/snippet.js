var EventEmitter = require('events').EventEmitter;


function Snippet(){
  // Initialize self as event emitter
  EventEmitter.call(this);

  this.name = "Unititled";
  this.data = null;
}

// Make snippet descend from EventEmitter
Snippet.prototype = Object.create(EventEmitter.prototype);

// Update the data, and trigger update event
Snippet.prototype.update = function (data) {
  this.data = data;
  this.emit('update');
}

// Export Snippet from module
exports.Snippet = Snippet;

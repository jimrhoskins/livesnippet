var socket = new io.Socket();
socket.connect();

socket.send({
  channel: 'foo'
});


socket.on('message', function (data) {
  console.log('Recieved', data);
  if (data.content) {
    document.getElementById('data').innerText = data.content;
  }
});

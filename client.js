var io = require('socket.io');

var socket = io('http://localhost/5000');
console.log('check 1', socket.connected);
socket.on('connect', function() {
  console.log('check 2', socket.connected);
});
var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    port = 8888;

//Server start
server.listen(port, '0.0.0.0', () => console.log('on port' + port))

//user server
var path = require('path');


app.use(express.static(path.join(__dirname, 'public2')));

app.get('/', function(req, res){
    res.sendFile('homepage.html', { root: __dirname  } );
});

app.get('/bonus', function(req, res){
    res.sendFile('bunuspage.html', { root: __dirname  } );
});


io.on('connection', onConnection);

var connectedSocket = null;
function onConnection(socket){
    connectedSocket = socket;
}

//Arduino to CMD
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline; 
const usbport = new SerialPort('COM6');  
const parser = usbport.pipe(new Readline()); 
parser.on('data', function (data) {
    var dataArray = data.split(' ');
    for(var i = 0; i< dataArray.length; i++){
        dataArray[i] = parseFloat(dataArray[i]);
        //console.log(dataArray[i]);
        console.log(data);
    }
    io.emit('data', { data: data, dataArray: dataArray });
});
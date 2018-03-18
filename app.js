var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var url= require('url');
var fs = require('fs');
var os = require('os');
var io = require('socket.io').listen(app);
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const serialport = new SerialPort('COM6',9600);
const parser = serialport.pipe(new Readline({ delimiter: '\r\n' }));



app.listen(5000);

/* SERIAL WORK */
serialport.open(function (error) {
 
    console.log('open');
    parser.on('data', function(data) {
       console.log('data received: ' + data);
      io.sockets.emit('IMU_data', data);
    });
    //serialPort.write("ls\n", function(err, results) {
    //  console.log('err ' + err);
    //  console.log('results ' + results);
    //});
  
});


// Http handler function

function handler (req, res) {
    
  // Using URL to parse the requested URL
  var path = url.parse(req.url).pathname;
  
  // Managing the root route
  if (path == '/') {
      index = fs.readFile(__dirname+'/three.html', 
          function(error,data) {
              
              if (error) {
                  res.writeHead(500);
                  return res.end("Error: unable to load three.html");
              }
              
              res.writeHead(200,{'Content-Type': 'text/html'});
              res.end(data);
          });

  // Managing the route for the javascript files
  } else if( /\.(js)$/.test(path) ) {
      index = fs.readFile(__dirname+path, 
          function(error,data) {
              
              if (error) {
                  res.writeHead(500);
                  return res.end("Error: unable to load " + path);
              }
              
              res.writeHead(200,{'Content-Type': 'text/plain'});
              res.end(data);
          });
  } else {
      res.writeHead(404);
      res.end("Error: 404 - File not found.");
  }
}
  
  // io.on('connection', function (socket) {
  //   socket.emit('news', { hello: 'world' });
  //   socket.on('my other event', function (data) {
  //     console.log(data);
  //   });
  // });
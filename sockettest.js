var express = require('express');				// include express.js
var app = express();								  	// a local instance of it

// serial port initialization:
var serialport = require('serialport');	// include the serialport library
var SerialPort  = serialport;					  // make a local instance of serial
var portName = process.argv[2];				  // get the port name from command line
var portConfig = {
	baudRate: 9600,
	// call myPort.on('data') when a newline is received:
	//parser: serialport.parsers.readline('\n')
};

// open the serial port:

const Readline = SerialPort.parsers.Readline;
const myPort = new SerialPort('COM6',9600);
const parser = myPort.pipe(new Readline({ delimiter: '\r\n' }));


// get an analog reading from the serial port.
// This is a callback function for when the client requests /device/channel:
function getSensorReading(request, response) {
	// the parameter after /device/ is the channel number:
	var channel = request.params.channel;
	console.log("getting channel: "+ channel + "...");

	// send the channel number out the serial port
	//and wait for a response:
	myPort.write(channel, function(){
		// when you get a response from the serial port,
		//write it out to the client:
		myPort.on('data', function(data) {
			// send the data and close the connection:
			response.end(data);
		});
	});
}

// start the server:
var server = app.listen(8080);
// start the listeners for GET requests:
app.use('/',express.static('public'));   // set a static file directory
app.get('/device/:channel', getSensorReading);	// GET handler for /device
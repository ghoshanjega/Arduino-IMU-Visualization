
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('COM6',9600);
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
parser.on('data', console.log);



// port.on('open', () => {
//     console.log('Port Opened');
//   });
  
//   port.write('main screen turn on', (err) => {
//     if (err) { return console.log('Error: ', err.message) }
//     console.log('message written');
//   });
  
//   port.on('data', (data) => {
//     /* get a buffer of data from the serial port */
//     console.log(data.toString());
//   });
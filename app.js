const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const net = require("net");
var PORT = 49150;
var mac = null;
console.log(mac);
var app = express();
var ipAddress = null;
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('*', function (req, res) {
    res.sendfile(path.join(__dirname,"index.html"));
});

app.post("/submitData/:value", (req, res, next) => {
    console.log('value====', req.params.value)
        saveMac(req.params.value);
        return res.json(true);
});
app.post("/sendMode/:selectedvalue", (req, res, next) => {
    console.log('selected value====',req.params.selectedvalue);
    if(mac !== null) {
        createTestModeCommand(req.params.selectedvalue);
        return res.json(true);
    } else {
        return res.json(false);
    }
});
app.post("/configuration/", (req, res, next) => {
    if(mac !== null) {
        configurationCommand(mac);
        return res.json(true);
    } else {
        return res.json(false);
    }
});
app.post("/submitIpAddress/:ipAddressVal", (req, res, next) => {
    if(mac !== null) {
        ipAddress = req.params.ipAddressVal;
        return res.json(true);
    } else {
        return res.json(false);
    }
});

app.post("/selectFile/", (req, res, next) => {
    console.log('selected value====',req.body);
    var file = req.body;
    // TODO: function for select file changes
    selectFile(); 
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    console.log('Received %d bytes from %s:%d\n',msg.length, rinfo.address, rinfo.port); 
});

server.on('listening', () => {
    server.setBroadcast(true);
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});
server.bind(PORT);

// This function will create poll packet buffer
var pollCommand = function(opcode){
    var data = "Advatech";
    var suffix = 0x00; // JavaScript allows hex numbers.
    var PortVer = 0x08;
    var dataSize = Buffer.byteLength(data);
    
    // compute the required buffer length
    var bufferSize = dataSize + 1 + 2 + 1;
    var buffer = Buffer.alloc(bufferSize);

    // store string starting at index 1;
    buffer.write(data, 0, dataSize);
    buffer.writeUInt8(suffix, dataSize);

    // stores last two bytes, in big endian format for TCP/IP.
    buffer.writeUInt16BE(opcode, dataSize + 1);

    buffer.writeUInt8(PortVer, dataSize + 3);
    return buffer;
};

// Call this function when dropdown item selected from web
var createTestModeCommand = function(currentSelection){
    if(mac == null){
        console.log("Mac address cannot be null");
        return;
     }
    
    var length = Buffer.byteLength(mac);
    var test_command = Buffer.alloc(14);
    mac.copy(test_command, 0);
    test_command.writeUInt8(currentSelection, length); // value of test mode
    if (currentSelection == 6 || currentSelection == 8)
        test_command.writeUInt8(255, length + 1); // value of test cols - red
    else
        test_command.writeUInt8(0, length + 1); // value of test cols - red
    test_command.writeUInt8(0, length + 2); // value of test cols - green
    test_command.writeUInt8(0, length + 3); // value of test cols - blue
    test_command.writeUInt8(0, length + 4); // value of test cols - white
    test_command.writeUInt8(0, length + 5); // value of test output num
    test_command.writeUInt16BE(currentSelection == 8 ? 5 : 0, length + 6); // value of test pixel number. Use 5 to check on webcam.
//    console.log(`test command:`);
//    console.log(test_command);
    testModeCommand(test_command);
    return true;
}

// This function will create and send buffer to client for test mode.
var testModeCommand = function(test_command){
    var buffer = pollCommand(0x0008);
  //  console.log(buffer);
    var test_buffer = Buffer.concat([buffer, test_command]);
  //  console.log(`Final command:`);
  //  console.log(test_buffer);
    sendServerComamnd(test_buffer);
};

// This function used to configure network settings
var networkConfigurationcommand = function(mac, op_code){
    var buffer = pollCommand(op_code);
    var network_config = Buffer.from([0,172,16,0,234,255,255,255,0]);
    var network_buffer = Buffer.concat([buffer, mac, network_config]);
    console.log("Network configuration");
    console.log(network_buffer);
    return network_buffer;
};

// This function is used to configure MossLED with udp command
var configurationCommand = function(mac){
    var network_buffer = networkConfigurationcommand(mac, 0x0005);
    var config_command = "01000001fe01fe01fe01fe01fe01fe01fe01fe000100040008000c001000140018001c000101f901f101e901e101d901d101c9000000000000000000000000000000000000000000000000000000000000000000000000000000000001000100010001000100010001000164646464646464640100011c010100141414144d6f73734c454431353500000000000000000000000000000000000000000000000000000000000023";
    config_command = Buffer.from(config_command, 'hex');
    var config_buffer = Buffer.concat([network_buffer, config_command]);
    console.log("Configuration");
    console.log(config_buffer.toString('hex'));
    sendServerComamnd(config_buffer);
};

// This is the function used to send command to client
var sendServerComamnd = function(buffer){
    console.log('ip address===',ipAddress)
    // '182.73.136.46'
    server.send(buffer, PORT, ipAddress, function (error, res) {
        console.log(`server command: `);
	console.log(buffer);
        if (error) {
            console.log(error);
            client.close();
        } else {
            console.log(res);
            console.log('Data sent !!!');
        }
    });
};

var saveMac = function(input){
        console.log("SAVE mac call===")
        var validCheck = /^[0-9a-fA-F]+$/;
        if(input != null && input.match(validCheck)){
        mac = Buffer.from(input.toLowerCase(), "hex");
        console.log('mac value==',mac)
    }
};

var selectFile = function() {

};
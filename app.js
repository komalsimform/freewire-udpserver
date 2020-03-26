const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
var app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('*', function (req, res) {
    res.sendfile(path.join(__dirname,"index.html"));
});

app.post("/url/:id", (req, res, next) => {
    console.log('req.body', req.params.id)
    // client
    var PORT = 49150;
    var message = Buffer.from(req.params.id);

    var client = dgram.createSocket('udp4');
    client.on('message', function (msg, info) {
        console.log('Data received from server : ', msg);
        console.log('Client Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
        client.close();
        if (!req.params.id) {
            return res.status(500).json({
                status: 'error',
                error: 'req params cannot be empty',
            });
        }
        return res.json({
            'success': true,
            'data': msg.toString(),
            'info': info.address + ':' + info.port
        });
    });
    client.on('connect', function (port, address) {
        console.log('connect port===', port)
        console.log('connect address====', address)
    });
    // 172.16.1.234
    client.send(message, 0, message.length, PORT, function (err, bytes) {
        // if (err) throw err;
        console.log('UDP message sent to ' + ':' + PORT);
        console.log('bytes====', bytes)
    });
});
app.listen(8084, () => {
    console.log("Server running on port 8084");
});

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    console.log('Received %d bytes from %s:%d\n',msg.length, rinfo.address, rinfo.port);
    server.send(msg, rinfo.port, 'localhost', function (error) {
        if (error) {
            client.close();
        } else {
            console.log('Data sent !!!');
        }
    })
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);

    //sending msg
});
server.bind(49150);
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
var app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/url/:id", (req, res, next) => {
    console.log('req.body', req.params.id)
    // client
    var PORT = 49150;
    var message = Buffer.from(req.params.id);

    var client = dgram.createSocket('udp4');
    client.on('message', function (msg, info) {
        console.log('Data received from server : ', msg);
        console.log('Received %d bytes from %s:%d', info);
        client.close();
        if (!req.params.id) {
            return res.status(500).json({
                status: 'error',
                error: 'req params cannot be empty',
            });
        }
        return res.json({
            'success': true,
            'data': msg.toString()
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
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});
// server.connect(49150, function (port, address) {
//     console.log('connect port===', port)
//     console.log('connect address====', address)
// });
server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
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

;



// const server = http.createServer((req, res) => {
//     if (req.method === 'POST') {
//         console.log('post request')
//         // collectRequestData(req, result => {
//         //     console.log(result);
//         //     res.end(`Parsed data belonging to ${result.fname}`);
//         // });
//     }
// })

server.bind(49150);
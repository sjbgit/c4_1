var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var bodyParser = require('body-parser');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

//http://stackoverflow.com/questions/25550819/error-most-middleware-like-bodyparser-is-no-longer-bundled-with-express
// parse application/json
router.use(bodyParser.json());

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }));

router.use(express.static(path.resolve(__dirname, 'client')));


/*
router.configure(function () {
    router.use(express.static(path.resolve(__dirname, 'client')));
    //router.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
    router.use(express.logger('dev')); 						// log every request to the console
    router.use(express.bodyParser()); 							// pull information from html in POST
    router.use(express.methodOverride()); 						// simulate DELETE and PUT
});
*/

router.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

router.get('/api/notify', function (req, res) {

    io.sockets.in('global').emit('message', { message: 'tasty' });

    res.json({message: 'test message from server'}); // return all todos in JSON format
});

router.post('/api/notify', function (req, res) {

    var room = req.body.room;
    var message = req.body.message;

    console.log()

    io.sockets.in(room).emit('message', { message: message });

    res.json({message: 'test message from server'}); // return all todos in JSON format
});

//var rooms = {};

io.sockets.on('connection', function(socket) {
    socket.on('join', function(data) {
        socket.join(data.room);

        console.log('client joined room:' + data.room);
        /*
        rooms[data.room] = {
            socket: socket
        };
        */

        socket.emit('roomJoined', {message: 'you have joined room: ' + data.room});

    });
});



server.listen(process.env.PORT || 4000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});

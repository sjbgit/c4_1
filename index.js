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
//run every second
var interval = setInterval(function(str1, str2) {
    console.log((new Date()) + ' ' + str1 + " " + str2);
}, 1000, "Hello.", "How are you?");

clearInterval(interval);
*/
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

var globalNotification = io
    .of('/globalNotification')
    .on('connection', function (socket) {
        // Send message to client like usual
        socket.emit('globalNotificationSubscribed', { message: 'you have subscribed to globalNotification' });
        // Broadcast message to everyone in this namespace
        //globalNamespace.emit('a message', { everyone: 'in', '/chat': 'will get' });
    });


router.post('/api/global', function (req, res) {

    //console.log(req);

    var message = req.body.message;

    console.log('sending global message: ' + message);

    globalNotification.emit('globalMessage', { message: message });

    //io.sockets.in(room).emit('message', { message: message });

    res.json({message: 'test message from server - GLOBAL'}); // return all todos in JSON format
});


/*
router.get('/api/notify', function (req, res) {

    io.sockets.in('global').emit('message', { message: 'tasty' });

    res.json({message: 'test message from server'}); // return all todos in JSON format
});
*/

router.post('/api/notify', function (req, res) {

    var room = req.body.room;
    var message = req.body.message;

    console.log('sending messsage: ' + message + ' to room: ' + room);

    io.sockets.in(room).emit('message', { message: message });

    res.json({message: 'test message from server'}); // return all todos in JSON format
});

//var rooms = {};

//EXCELLENT
//http://www.joezimjs.com/javascript/plugging-into-socket-io-advanced/
//using
//http://stackoverflow.com/questions/15909821/socket-io-join-leave
//maybe
//http://stackoverflow.com/questions/6873607/socket-io-rooms-difference-between-broadcast-to-and-sockets-in?rq=1
//get client ids in a room
//http://stackoverflow.com/questions/23930388/joining-same-room-more-then-once-and-clients-in-a-room?rq=1
//https://coderwall.com/p/ekrcyw/socket-io-managing-single-user-multi-connections

io.sockets.on('connection', function(socket) {
    socket.on('subscribe', function(data) {
        socket.join(data.room);
        //console.log(socket);
        console.log('client subscribed to room:' + data.room);
        socket.emit('subscribed', {message: 'you have subscribed to room: ' + data.room});
    })
    socket.on('unsubscribe', function(data) {
        socket.leave(data.room);
        console.log('client subscribed to room:' + data.room);
    })
});

//works
/*
io.sockets.on('connection', function(socket) {
    socket.on('join', function(data) {
        socket.join(data.room);

        console.log('client joined room:' + data.room);


        socket.emit('roomJoined', {message: 'you have joined room: ' + data.room});

    });
});
*/


server.listen(process.env.PORT || 4000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});

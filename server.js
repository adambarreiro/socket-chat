/**
 * @author Adam Barreiro <adambarreiro@gmail.com>
 *
 * See GitHub repo for more info:
 * https://github.com/adambarreiro/socket-chat
 * -------------------------------------------------------------------------------------
 *
 * Server core module. Exports the application for the invocation from
 * bin/www.js and initializes all the middleware: Logging, routing, chat...
 */

var express = require('express');
var app = express();
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = require('./routes/index');
var chat = require('./chat/chat');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
router(app);
io.on('connection', function(socket) {
 socket.on('chat-Pepito', function(msg) {
   io.emit('chat-admin', msg);
 });
});


http.listen(8080, function(){
  console.log('listening on *:8080');
});

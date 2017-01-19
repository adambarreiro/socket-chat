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
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = require('./routes/index');
var chat = require('./chat/chat');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '../web')));
app.use(express.static(path.join(__dirname, '../components')));
router(app);
io.on('connection', function(socket) {
 socket.on('chat message', function(msg) {
   io.emit('chat message', msg);
 });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});

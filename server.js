/**
 * @author Adam Barreiro <adambarreiro@gmail.com>
 *
 * See GitHub repo for more info:
 * https://github.com/adambarreiro/socket-chat
 * -------------------------------------------------------------------------------------
 *
 * Server core module. Initializes all the middleware and modules.
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
app.use(express.static(path.join(__dirname,'public')));
app.use('/bower_components', express.static(path.join(__dirname,'bower_components')));
router(app);
chat(io);
http.listen(process.env.PORT || 8080, function(){
  console.log('CHAT SERVER STARTED:' + (process.env.PORT || 8080));
});

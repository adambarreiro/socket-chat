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
app.use(express.static(path.join(__dirname,'public')));
app.use('/bower_components', express.static(path.join(__dirname,'bower_components')));
router(app);
var users = [];
var admin_id;
io.on('connection', function(socket) {
  socket.on('admin-start', function() {
    if (admin_id === undefined) {
      admin_id = socket.id;
      console.log("ADMIN is connected with ID=" + admin_id);
      io.to(admin_id).emit('admin-started');
    }
  });

  socket.on('user-start', function(message) {
    if (users[message.user] === undefined) {
      users[message.user] = socket.id;
      console.log(message.user + " is connected with ID=" + socket.id);
      io.to(socket.id).emit('user-started');
    }
  });

  socket.on('chat', function(message) {
    if (socket.id === admin_id) {
      console.log('Message to ' + message.to + '('+users[message.to]+') from ADMIN('+admin_id+')')
      io.to(users[message.to]).emit('chat', message);
    } else {
      console.log('Message to ADMIN('+admin_id+') from '+ message.from + '('+users[message.from]+')');
      io.to(admin_id).emit('chat', message);
    }
  })

  socket.on('disconnect', function() {
    if (socket.id === admin_id) {
      admin_id = undefined;
      console.log('ADMIN with ID='+socket.id+' disconnected!');
    } else {
      for (var user in users) {
        if (socket.id === users[user]) {
          delete users[user];
          break;
        }
      }
      console.log(user + ' with ID='+socket.id+' disconnected!');
    }
  });
});

http.listen(process.env.PORT || 8080, function(){
  console.log('CHAT SERVER STARTED:' + (process.env.PORT || 8080));
});

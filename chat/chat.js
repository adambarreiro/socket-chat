/**
 * @author Adam Barreiro <adambarreiro@gmail.com>
 *
 * See GitHub repo for more info:
 * https://github.com/adambarreiro/socket-chat
 * -------------------------------------------------------------------------------------
 *
 * Chat module.
 */

var logger = require('morgan');
module.exports = function(io) {
  var users = [];
  var admin

  io.on('connection', function(socket) {
    socket.on('admin-start', function() {
      if (admin === undefined) {
        admin = socket;
        console.log("ADMIN is connected with ID=" + admin.id);
      } else {
        io.to(admin.id).emit('admin-start-error', {error: 'Logged out! Someone has logged in as ADMIN!'});
        admin.disconnect();
        admin = socket;
      }
      io.to(admin.id).emit('admin-started');
      socket.broadcast.emit('admin-started');
    });

    socket.on('user-start', function(message) {
      if (users[message.user] === undefined) {
        users[message.user] = socket.id;
        console.log(message.user + " is connected with ID=" + socket.id);
        io.to(socket.id).emit('user-started');
      }
    });

    socket.on('chat', function(message) {
      if (socket.id === admin.id) {
        console.log('Message to ' + message.to + '('+users[message.to]+') from ADMIN('+admin.id+')')
        io.to(users[message.to]).emit('chat', message);
      } else {
        if (admin === undefined) {
          console.log('Message to ADMIN('+admin.id+') from '+ message.from + '('+users[message.from]+')');
          io.to(socket.id).emit('chat-error', {error: 'No ADMIN connected'});
        } else {
          console.log('Message to ADMIN('+admin.id+') from '+ message.from + '('+users[message.from]+')');
          io.to(admin.id).emit('chat', message);
        }

      }
    })

    socket.on('disconnect', function() {
      if (socket.id === admin.id) {
        admin = undefined;
        console.log('ADMIN with ID='+socket.id+' disconnected!');
      } else {
        for (var user in users) {
          if (socket.id === users[user]) {
            delete users[user];
            break;
          }
        }
        console.log(user + ' with ID='+socket.id+' disconnected!');
        io.to(admin.id).emit('user-disconnect', {user: user});
      }
    });
  });

};

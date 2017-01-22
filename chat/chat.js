/**
 * @author Adam Barreiro <adambarreiro@gmail.com>
 *
 * See GitHub repo for more info:
 * https://github.com/adambarreiro/socket-chat
 * -------------------------------------------------------------------------------------
 *
 * Chat module.
 */

module.exports = function(io) {
  var USERS = [];
  var ADMIN;

  io.on('connection', function(socket) {
    socket.on('admin-start', function() {
      if (ADMIN === undefined) {
        createAdmin(io, socket);
      } else {
        changeAdmin(io, socket);
      }
    });

    socket.on('user-start', function(message) {
      if (USERS[message.user] === undefined) {
        createUser(io, socket, message);
      } else {
        changeUser(io, socket, message);
      }
    });

    socket.on('chat', function(message) {
      if (ADMIN !== undefined && socket.id === ADMIN.id) {
        sendMessageToUser(io, socket, message);
      } else {
        if (ADMIN === undefined) {
          noAdminError(io, socket, message);
        } else {
          sendMessageToAdmin(io, socket, message);
        }
      }
    })

    socket.on('disconnect', function() {
      if (ADMIN !== undefined && socket.id === ADMIN.id) {
        disconnectAdmin(socket);
      } else {
        disconnectUser(io, socket);
      }
    });
  });

  function createAdmin(io, socket) {
    ADMIN = socket;
    io.to(ADMIN.id).emit('admin-started');
    socket.broadcast.emit('admin-started');
    console.log("ADMIN is connected with ID=" + ADMIN.id);
  }

  function changeAdmin(io, socket) {
    console.log("ADMIN conflict! Deleting " + ADMIN.id + " and creating " + socket.id);
    io.to(ADMIN.id).emit('admin-start-error', {error: 'Logged out! Someone has logged in as ADMIN!'});
    ADMIN.disconnect();
    ADMIN = socket;
    io.to(ADMIN.id).emit('admin-started');
    socket.broadcast.emit('admin-started');
  }

  function createUser(io, socket, message) {
    USERS[message.user] = socket;
    io.to(USERS[message.user].id).emit('user-started');
    console.log(message.user + " is connected with ID=" + USERS[message.user].id);
  }

  function changeUser(io, socket, message) {
    console.log("USER conflict! Deleting " + USERS[message.user].id + " and creating " + socket.id);
    io.to(USERS[message.user].id).emit('user-start-error', {error: 'Logged out! Someone has logged in as '+message.user+'!'});
    USERS[message.user].disconnect();
    USERS[message.user] = socket;
    io.to(USERS[message.user].id).emit('user-started');
  }

  function disconnectAdmin(socket) {
    ADMIN = undefined;
    socket.broadcast.emit('admin-disconnect');
    console.log('ADMIN with ID='+socket.id+' disconnected!');
  }

  function disconnectUser(io, socket) {
    for (var user in USERS) {
      if (socket.id === USERS[user].id) {
        delete USERS[user];
        break;
      }
    }
    console.log(user + ' with ID='+socket.id+' disconnected!');
    if (ADMIN !== undefined) {
        io.to(ADMIN.id).emit('user-disconnect', {user: user});
    }
  }

  function sendMessageToUser(io, socket, message) {
    console.log('Message to ' + message.to + '('+USERS[message.to].id+') from ADMIN('+ADMIN.id+')')
    io.to(USERS[message.to].id).emit('chat', message);
  }

  function sendMessageToAdmin(io, socket, message) {
    console.log('Message to ADMIN('+ADMIN.id+') from '+ message.from + '('+USERS[message.from].id+')');
    io.to(ADMIN.id).emit('chat', message);
  }

  function noAdminError(io, socket, message) {
    console.log('No ADMIN connected, responding to '+ message.from + '('+USERS[message.from].id+')');
    io.to(socket.id).emit('chat-error', {error: 'No ADMIN connected'});
  }


};

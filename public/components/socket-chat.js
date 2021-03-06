var SocketChat = (function($) {

  // Elements
  const usersBox = '.left';
  const chatBox = '.right';
  const usersList = '#users';
  const selectedUser = '#selected';
  const messageInput = '#message';
  const admin = 'admin';
  const sendButton = '#send';
  const submit = '.bottom';
  const conversationBox = '#conversation';

  // Socket.IO Events
  const chatEvent = 'chat';
  const adminStartedEvent = 'admin-started';
  const userStartedEvent = 'user-started';
  const adminStartRequest = 'admin-start';
  const userStartRequest = 'user-start';
  const chatErrorEvent = 'chat-error';
  const adminStartErrorEvent = 'admin-start-error';
  const userStartErrorEvent = 'user-start-error';
  const userDisconnectEvent = 'user-disconnect';
  const adminDisconnectEvent = 'admin-disconnect';

  // Private functions
  function getSelectedUser() {
    return $(selectedUser).text();
  }

  function getMessage() {
    return $(messageInput).val();
  }

  function clearMessageInput() {
    $(messageInput).val('');
  }

  function isChatListEmpty() {
    return $(usersList).children().length === 0;
  }

  function isMessageInputEmpty() {
    return $(messageInput).val() === '';
  }

  function isSomebodySelected() {
    return $(selectedUser).length !== 0;
  }

  function writeMessage(user, text, type) {
    if (type === 'error') {
      $(conversationBox).append($('<li><span class="error"><b>'+Utils.getTime()+' [ERROR]: </b>'+text+'</span></li>'));
    } else if (type === 'info') {
      $(conversationBox).append($('<li><span class="info"><b>'+Utils.getTime()+' [INFO]: </b>'+text+'</span></li>'));
    } else {
      $(conversationBox).append($('<li><span class="date"><b>'+Utils.getTime()+' '+user+": </b></span>" + text + '</li>'));
    }
    $(chatBox).scrollTop($(chatBox)[0].scrollHeight);
  }

  function isAdmin(user) {
    return (user === admin);
  }

  function showUsersBox() {
    $(usersBox).show();
  }

  function hideUsersBox() {
    $(usersBox).remove();
    $(chatBox).css({'width': '100%'});
    $(messageInput).css({'width': '85%'});
  }

  function addUserToChatList(user) {
    var selectDefault = false;
    if ($(usersList).children().length === 0) {
      selectDefault = true;
    }
    var found = $(usersList).children('li:contains('+user+')').text();
    if (found === undefined || found === "") {
      var newElement = $('<li>'+user+'</li>');
      $(usersList).append(newElement);
      $(newElement).click(function() {
        $(selectedUser).removeAttr('id');
        $(newElement).attr('id','selected');
      });
      if (selectDefault) {
        $(newElement).attr('id','selected');
      }
    }
  }

  function removeUserFromChatList(user) {
    $(usersList).children('li:contains('+user+')').remove();
  }

  function onAdminStarted(socket, user) {
    showUsersBox();
    socket.on(adminStartedEvent, function() {
      $(submit).submit(function(e) {
        e.preventDefault();
        if (isChatListEmpty()) {
          writeMessage(null, 'There\'s no connected users', 'error');
        } else if (!isSomebodySelected()) {
          writeMessage(null, 'There\'s no selected users to chat with', 'error');
        } else if (!isMessageInputEmpty()) {
          var message = {
            to: getSelectedUser(),
            text: getMessage()
          };
          socket.emit(chatEvent, message);
          writeMessage('ADMIN answering to ' + message.to, message.text);
          clearMessageInput();
        }
        return false;
      });
    });
    socket.emit(adminStartRequest);
  }

  function onUserStarted(socket, user) {
    hideUsersBox();
    socket.on(userStartedEvent, function() {
      $(submit).submit(function(e) {
        e.preventDefault();
        if (!isMessageInputEmpty()) {
          var message = {
            from: user,
            text: getMessage()
          };
          socket.emit(chatEvent, message);
          writeMessage(message.from, message.text);
          clearMessageInput();
        }
        return false;
      });
      socket.on(adminStartedEvent, function() {
        writeMessage(null, 'Customer support is online!', 'info');
      });
    });
    socket.emit(userStartRequest, {user: user});
  }

  // Public functions
  return {
    getCurrentUser: function(isAdmin, user) {
      return (isAdmin ? admin : user);
    },
    onChatStarted: function(socket, user) {
      if (isAdmin(user)) {
        onAdminStarted(socket, user);
      } else {
        onUserStarted(socket, user);
      }
    },
    onChat: function(socket, user) {
      socket.on(chatEvent, function(message) {
        var from;
        if (isAdmin(user)) {
          from = message.from;
          addUserToChatList(message.from);
        } else {
          from = 'Customer support (Administrator)';
        }
        writeMessage(from, message.text);
      });
    },
    onChatError: function(socket, user) {
      socket.on(chatErrorEvent, function(message) {
        writeMessage(null, message.error, 'error');
      });
    },
    onAdminStartError: function(socket, user) {
      socket.on(adminStartErrorEvent, function(message) {
        writeMessage(null, message.error, 'error');
        $(submit).remove();
      });
    },
    onUserStartError: function(socket, user) {
      socket.on(userStartErrorEvent, function(message) {
        writeMessage(null, message.error, 'error');
        $(submit).remove();
      });
    },
    onUserDisconnect: function(socket, user) {
      socket.on(userDisconnectEvent, function(message) {
        if (isAdmin(user)) {
            removeUserFromChatList(message.user);
            writeMessage(null, message.user + ' has disconnected!', 'info');
        }
      });
    },
    onAdminDisconnect: function(socket, user) {
      socket.on(adminDisconnectEvent, function(message) {
        writeMessage(null, 'Customer support is disconnected!', 'info');
      });
    },
  }
})($);

var Utils = (function() {
  function pad(num, size) {
    var s = num+'';
    while (s.length < size) s = '0' + s;
    return s;
  }

  return {
    getTime: function() {
      var date = new Date();
      var hour = date.getHours();
      var min = date.getMinutes();
      var second = date.getSeconds();
      return pad(hour,2)+':'+pad(min,2)+':'+pad(second,2);
    }
  }
})($);

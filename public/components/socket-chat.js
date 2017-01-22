var SocketChat = (function($) {

  // Elements
  const usersBox = '.left';
  const usersList = '#users';
  const selectedUser = '#selected';
  const messageInput = '#message';
  const admin = 'admin';
  const sendButton = '#send';
  const conversationBox = '#conversation';

  // Socket.IO Events
  const chatEvent = 'chat';
  const adminStartedEvent = 'admin-started';
  const userStartedEvent = 'user-started';
  const adminStartRequest = 'admin-start';
  const userStartRequest = 'user-start';
  const chatErrorEvent = 'chat-error';
  const userDisconnectEvent = 'user-disconnect';

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
  }

  function isAdmin(user) {
    return (user === admin);
  }

  function showUsersBox() {
    $(usersBox).show();
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
    socket.on(adminStartedEvent, function() {
      showUsersBox();
      $(sendButton).click(function() {
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
      });
    });
    socket.emit(adminStartRequest);
  }

  function onUserStarted(socket, user) {
    socket.on(userStartedEvent, function() {
      $(sendButton).click(function() {
        if (!isMessageInputEmpty()) {
          var message = {
            from: user,
            text: getMessage()
          };
          socket.emit(chatEvent, message);
          writeMessage(message.from, message.text);
          clearMessageInput();
        }
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
    onUserDisconnect: function(socket, user) {
      socket.on(userDisconnectEvent, function(message) {
        if (isAdmin(user)) {
            removeUserFromChatList(message.user);
            writeMessage(null, message.user + ' has disconnected!', 'info');
        }
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

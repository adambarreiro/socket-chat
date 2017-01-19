/**
 * @author Adam Barreiro <adambarreiro@gmail.com>
 *
 * See GitHub repo for more info:
 * https://github.com/adambarreiro/socket-chat
 * -------------------------------------------------------------------------------------
 *
 * Routing for the server.
 */

var express = require('express');
var path = require('path');
var index = express.Router();

module.exports = function(app) {

  index.get('/index.html', function(request, response, next) {
    response.sendFile(path.join(__dirname, '../web', 'index.html'));
  });
  index.get('/chat.html', function(request, response, next) {
    response.sendFile(path.join(__dirname, '../components/chat', 'chat.html'));
  });
  index.get('/', function(request, response, next) {
    response.redirect('/index.html');
  });
  app.use('/', index);
};

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
var mustache = require("mustache");
var fs = require("fs");
var path = require('path');
var index = express.Router();

module.exports = function(app) {
  index.get('/', function(request, response) {
    response.redirect('/index.html');
  });

  index.post('/user', function(request, response) {
    if (request.body.name === undefined || request.body.name === 'admin') {
      response.redirect('/');
    } else {
      var name = request.body.name;
      var page = fs.readFileSync(path.join(__dirname,"..","public","user.html")).toString();
      var rendered = mustache.render(page, {username: name});
      response.send(rendered);
    }
  });

  index.post('/admin', function(request, response) {
    response.redirect('/admin.html');
  });

  app.use('/', index);
};

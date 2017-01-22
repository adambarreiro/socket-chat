# Coding Challenge
## Description
This challenge consists of a chat component in a responsive web.

The demonstration app allows to login as an user or an administrator. The administrator must be unique, and there can be any amount of different users. All the text the user writes in the chat will go to the administrator, and the administrator must choose in her chat window whom is going to send the answer.

## Try it
First, go to:

https://abc-socket-chat.herokuapp.com

You will see a very simple landing page with two options:

* The first one allows you to set an username to start a chat like you were a customer. All the messages you send will go to the administrator chat.

* The second one starts the administrator chat, to see all the customers messages.

All the chats start in a new tab.

## Local installation
* Download the repository in any folder of your choice with Git:

`git clone https://github.com/adambarreiro/socket-chat.git`

* Install Node.js for your OS:

`https://nodejs.org/en/download/`

* Install the application with NPM. This will download Node dependencies and Bower dependencies:

```
cd socket-chat
npm install
```

* Launch the Node server:

```
cd socket-chat
npm start
```

## Tech stack

* **Node.js**: A JavaScript engine built on top of V8, ideal for developing asynchronous services with almost no I/O operations.
* **Express.js**: A Node.js module for building web services quickly and fast, with easy and modular routing, support of powerful middleware (body parsing, CSRF protection, JWT authentication, cookies...).
* **Socket.IO**: A JavaScript framework built on top of WebSockets technology, allows to open a persistent & direct channel from the frontend to the backend, in which information flows until it's closed. All of this using HTTP protocol.
* **Polymer**: A JavaScript framework that allows to build HTML components, in order to reuse them all along the frontend application.
* **Mustache**: A JavaScript framework that allows to build text/HTML templates, substituting parameters between curl braces {{}} with a JSON data.

## TODO
* The app is completely insecure, so... :)
* Proper user/admin management (one user per chat, login, ...).
* CSS generating with a tool like Sass or Less.
* Chat tabs instead of one chat window.
* Two or more ADMINs trying to connect cause unexpected behaviour.

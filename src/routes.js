const express = require('express');
const UserController = require('./controllers/User');

const routes = express.Router();

routes.post('/user', UserController.createNewUser);
routes.post('/login', UserController.login);

module.exports = routes;
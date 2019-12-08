const express = require('express');
const QuestionController = require('./controllers/QuestionControllers');
const ClassroomController = require('./controllers/ClassroomController');
const GameController = require('./controllers/GameController');
const TeacherController = require('./controllers/TeacherController');
const ThemesController = require('./controllers/ThemeController');
const routes = express.Router();

// Rotas de perguntas
routes.post('/questions', QuestionController.create);
routes.get('/questions', QuestionController.getAll);
routes.delete('/questions/:id', QuestionController.delete);
routes.put('/questions/:id', QuestionController.edit);

// Rotas de salas
routes.post('/classrooms', ClassroomController.create);
routes.get('/classrooms', ClassroomController.getAll);
routes.delete('/classrooms/:id', ClassroomController.delete);
routes.put('/classrooms/:id', ClassroomController.edit);

// Rotas dos jogos
routes.post('/games', GameController.createGame);
routes.get('/games', GameController.getAll);

// Rota de login
routes.post('/login', TeacherController.login)

// Rota de temas
routes.get('/themes', ThemesController.getAll)

module.exports = routes;
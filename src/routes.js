const express = require('express');
const QuestionController = require('./controllers/QuestionControllers');
const ClassroomController = require('./controllers/ClassroomController');
const routes = express.Router();

// Rotas de perguntas
routes.post('/questions', QuestionController.create);
routes.get('/questions', QuestionController.getAll);
routes.delete('/questions/:id', QuestionController.delete);
routes.put('/questions/:id', QuestionController.edit);

routes.post('/classrooms', ClassroomController.create);
routes.get('/classrooms', ClassroomController.getAll);
routes.delete('/classrooms/:id', ClassroomController.delete);
routes.put('/classrooms/:id', ClassroomController.edit);

module.exports = routes;
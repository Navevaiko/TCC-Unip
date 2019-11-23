const express = require('express');
const QuestionController = require('./controllers/QuestionControllers');
const routes = express.Router();

routes.post('/questions', QuestionController.create);
routes.get('/questions', QuestionController.getAll);
routes.delete('/questions/:id', QuestionController.delete);
routes.put('/questions/:id', QuestionController.edit);

module.exports = routes;
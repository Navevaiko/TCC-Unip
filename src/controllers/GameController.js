const firebaseApp = require('../config/firebase_config');
const uuid = require('uuid');
const utils = require('../utils/index');

const socketController = require('./SocketController');
const questionController = require('./QuestionControllers');
const classroomController = require('./ClassroomController');

require('firebase/firestore');

const firestore = firebaseApp.firestore();
const collectionName = 'Games';

const createTeam = (teamName, color) => {
    let pinCode = '';
    
    for(let i = 0; i < 3; i++) {
        pinCode += Math.ceil(Math.random() * 9).toString();
    }

    return {
        id: uuid(),
        teamName,
        pinCode: parseInt(pinCode),
        logged: false,
        color,
        answeredQuestions: []
    }
}

module.exports = {
    async createGame(req, res) {
        try {
            const {
                questions,
                classroomId
            } = req.body;

            const id = uuid();
            const creationDate = utils.getCurrentTime();
            const firstTeam = createTeam('Team A', 'blue');
            const secondTeam = createTeam('Team B', 'red');

            const questionData = await firestore.collection('Questions').doc(questions[0]).get();
            const theme = questionData.data().theme; 

            await firestore.collection(collectionName).doc(id).set({
                questions,
                classroomId,
                theme,
                creationDate,
                teams: [ firstTeam, secondTeam ],
                status: 'STARTED'
            });

            const socketConnection = socketController.createSocket(id);

            res.json({ success: true, message: 'Jogo iniciado com sucesso', socketConnection, teams: [firstTeam, secondTeam] });
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: 'Erro ao iniciar o jogo'  });
        }
    },

    async getAll(req, res) {
        try {
            const { theme, classroomId } = req.query;
            console.log(req);
            const gameData = await firestore.collection(collectionName).get();
            const games = [];

            gameData.forEach(game => {
                games.push({ id: game.id, data: game.data() });
            });
            
            const fullGames = [];
            
            const promisses = games.map(async game => {

                if(game.data.classroomId == classroomId && game.data.theme == theme) {
                    const classroom = await classroomController.getById(game.data.classroomId);
                    const questions = [];

                    const questionPromisse = game.data.questions.map(async questionId => {
                        console.log(questionId);
                        questions.push(await questionController.getById(questionId));
                    });

                    await Promise.all(questionPromisse);
                    
                    const gameObj = { 
                        id: game.id, 
                        teams: game.data.teams,
                        status: game.data.status,
                        theme: game.data.theme,
                        winner: game.data.winner,
                        creationDate: game.data.creationDate,
                        classroom,
                        questions
                    }
                    
                    fullGames.push(gameObj);

                    return gameObj;
                }
            });

            await Promise.all(promisses);
            
            const orderedGames = fullGames.sort(function(d1, d2){
                return new Date(d1.creationDate) - new Date(d2.creationDate);
            });

            res.json({ success: true, message: 'Lista retornada com sucesso', orderedGames });
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: 'Erro ao retornar lista', games: [] });
        }        
    }
}
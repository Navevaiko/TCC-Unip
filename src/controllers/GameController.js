const firebaseApp = require('../config/firebase_config');
const uuid = require('uuid');
const utils = require('../utils/index');
const socketController = require('./SocketController');

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
                classroom
            } = req.body;

            const id = uuid();
            const creationDate = utils.getCurrentTime();
            const firstTeam = createTeam('Team A', 'blue');
            const secondTeam = createTeam('Team B', 'red');

            const theme = questions[0].data.theme;

            await firestore.collection(collectionName).doc(id).set({
                questions,
                classroom,
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
            const { theme, classroom } = req.body;

            const gameData = await firestore.collection(collectionName).get();
            const games = [];

            gameData.forEach(game => {
                if(game.data().classroom.id == classroom.id && game.data().theme == theme) {
                    games.push({ id: game.id, data: game.data() });
                }
            });

            const orderedGames = games.sort(function(d1, d2){
                return new Date(d1) - new Date(d2);
            });
            
            res.json({ success: true, message: 'Lista retornada com sucesso', orderedGames });
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: 'Erro ao retornar lista', games: [] });
        }        
    }
}
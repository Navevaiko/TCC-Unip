const firebaseApp = require('../config/firebase_config');
const uuid = require('uuid');
const utils = require('../utils/index');
// const socketController = require('../controllers/SocketController');

require('firebase/firestore');

const firestore = firebaseApp.firestore();
const collectionName = 'Games';

const createTeam = (teamName, color) => {
    let pinCode = '';
    
    for(let i = 0; i < 3; i++) {
        pinCode += Math.ceil(Math.random() * 9).toString();
    }

    return {
        teamName,
        pinCode: parseInt(pinCode),
        logged: false,
        color,
    }
}

module.exports = {
    async createGame(req, res) {
        try {
            const {
                questions,
                classroom,
                theme
            } = req.body;

            const id = uuid();
            const creationDate = utils.getCurrentTime();
            const firstTeam = createTeam('Team A', 'blue');
            const secondTeam = createTeam('Team B', 'red');

            await firestore.collection(collectionName).doc(id).set({
                questions,
                classroom,
                theme,
                creationDate,
                teams: [ firstTeam, secondTeam ]
            });

            // const socketConnection = socketController.createSocket(id);

            res.json({ success: true, message: 'Jogo iniciado com sucesso', socketConnection  });
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: 'Erro ao iniciar o jogo'  });
        }
    },

    async checkPinCode(gameId, pinCode) {
        try {
            const game = firestore.collection(collectionName).doc(gameId);
            
            const gameData = await game.get(); 
            
            const team = gameData.data().teams.find(team => team.pinCode == pinCode && !team.logged);
            if(team)  {
                const updatedTeams = gameData.data().teams.map(team => { 
                    if(team.pinCode == pinCode) team.logged = true;
                    return team; 
                });
                
                game.update({ teams: updatedTeams });
                
                return { teamName: team.teamName, success: true };
            }
            else return { teamName: '', success: false };
        } catch (error) {
            console.log(error);
            return { teamName: '', success: false };
        }
    },

    async areBothTeamsLogged(gameId) {
        try {
            const gameDoc = await firestore.collection(collectionName).doc(gameId).get();
            
            const teamsLogged = gameDoc.data().teams.filter(team => team.logged);
            
            return teamsLogged.length == gameDoc.data().teams.length;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
};
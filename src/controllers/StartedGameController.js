const firebaseApp = require('../config/firebase_config');
require('firebase/firestore');

const firestore = firebaseApp.firestore();
const collectionName = 'Games';

module.exports = {
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
    },

    async getUnansweredQuestions(gameId, teamName) {
        try {
            const gameData = await firestore.collection(collectionName).doc(gameId).get();
            
            const answeredQuestions = gameData.data().teams.find(team => team.teamName == teamName).answeredQuestions;
            
            const unansweredQuestions = gameData.data().questions.filter(question =>
                !answeredQuestions.find(item => item.questionId == question.id)
            );
            
            return unansweredQuestions;
        } catch (error) {
            console.log(error);
            return [];
        }
    },

    async getCorrectAnswer(gameId, questionId) {
        try {
            const gameData = await firestore.collection(collectionName).doc(gameId).get();
            
            const { data: { correct_answer } } = gameData.data().questions.find(question => question.id == questionId);
            
            return correct_answer;
        } catch (error) {
            console.log(error);
            return '';
        }
    },

    async addQuestionToTeamAnsweredQuestions(gameId, teamName, questionObj) {
        try {
            const gameDoc = await firestore.collection(collectionName).doc(gameId);
            const gameData = await gameDoc.get();

            const changedTeam = gameData.data().teams.find(team => team.teamName == teamName);
            
            changedTeam.answeredQuestions.push(questionObj);

            const updatedTeams = gameData.data().teams.map(team => { 
                if(team.teamName == teamName) team = changedTeam;
                return team;
            });

            await gameDoc.update({ teams: updatedTeams });
        } catch (error) {
            console.log(error);
        }
    },

    async getFinishedTeams(gameId) {
        try {
            const gameData = await firestore.collection(collectionName).doc(gameId).get();
            
            const finishedTeams = [];

            gameData.data().teams.forEach(team => {
                if(team.answeredQuestions.length == gameData.data().questions.length) {
                    const correctAnswers = team.answeredQuestions.filter(question => question.isCorrect);
                    finishedTeams.push({ team: team.teamName, score: correctAnswers.length });
                }
            });
            
            return finishedTeams;
        } catch (error) {
            console.log(error);
            return [];
        }
    },

    async getTeams(gameId) {
        try {
            const gameData = await firestore.collection(collectionName).doc(gameId).get();
            
            return gameData.data().teams;
        } catch (error) {
            console.log(error);
            return [];
        }
    },

    async finishGame(gameId, winner) {
        try{
            await firestore.collection(collectionName).doc(gameId).update({ status: 'FINISHED', winner });
        }catch(error){
            console.log(error);
        }
    }
};
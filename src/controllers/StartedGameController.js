const firebaseApp = require('../config/firebase_config');
require('firebase/firestore');
require('firebase/database');

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
            
            const unansweredQuestions = gameData.data().questions.filter(questionId =>
                !answeredQuestions.find(item => item.questionId == questionId)
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
            const id  = gameData.data().questions.find(id => id == questionId);
            
            const questionData = await firestore.collection('Questions').doc(id).get();
            const { correct_answer } = questionData.data();
            
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
            const score = changedTeam.answeredQuestions.filter(question => question.isCorrect).length;

            const updatedTeams = gameData.data().teams.map(team => { 
                if(team.teamName == teamName) team = changedTeam;
                return team;
            });

            await gameDoc.update({ teams: updatedTeams });
            return score * 10;
        } catch (error) {
            console.log(error);
            return 0;
        }
    },

    async getFinishedTeams(gameId) {
        try {
            const gameData = await firestore.collection(collectionName).doc(gameId).get();
            
            const finishedTeams = [];

            gameData.data().teams.forEach(team => {
                if(team.answeredQuestions.length == gameData.data().questions.length) {
                    const correctAnswers = team.answeredQuestions.filter(question => question.isCorrect);
                    finishedTeams.push({ team: team.teamName, score: correctAnswers.length * 10 });
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
    },

    async getScore(gameId) {
        try{
            const gameData = await firestore.collection(collectionName).doc(gameId).get();
            const currScore = [];

            gameData.data().teams.forEach(team => {
                const correctAnswers = team.answeredQuestions.filter(question => question.isCorrect);
                currScore.push({ team: team.teamName, score: correctAnswers.length * 10 });
            });

            return currScore;
        }catch(error) {
            console.log(error);
            return [];
        }
    },

    async setLed(color) {
        try {
            await firebaseApp.database().ref('led').set(color);
        } catch (error) {
            console.log(error);
        }
    }
};
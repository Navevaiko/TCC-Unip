const app = require('../server');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const GameController = require('./StartedGameController');

let currTeam = '';

module.exports = {
    createSocket(id) {
        const game = io.of('/' + id).on('connection', socket => {
            socket.on('checkPinCode', async data => {
                const result = await GameController.checkPinCode(id, data.code);
                
                if(result.success) {
                    socket.emit('checkPinCode', { isOk: true, team: result.teamName });                    
                }else{
                    socket.emit('checkPinCode', { isOk: false, team: '' });
                }
            });

            socket.on('startGame', async data => {
                if(await GameController.areBothTeamsLogged(id)) {
                    currTeam = data.team;
                    game.emit('startGame', { started: true, team: currTeam });
                }else{
                    socket.emit('startGame', { started: false });
                }
            });

            socket.on('sendQuestion', async () => {
                const unansweredQuestions = await GameController.getUnansweredQuestions(id, currTeam);
                
                const randomIndex = Math.ceil(Math.random() * unansweredQuestions.length - 1);
                const question = unansweredQuestions[randomIndex];
                
                if(question) {
                    socket.emit('question', { question, currTeam });
                }else{
                    socket.emit('question', { question: undefined, currTeam });
                }
            });

            socket.on('verifyQuestion', async data => {
                const correctAnswer = await GameController.getCorrectAnswer(id, data.questionId);
                const isCorrect = correctAnswer == data.answer;
                
                await GameController.addQuestionToTeamAnsweredQuestions(
                    id, 
                    currTeam, 
                    { questionId: data.questionId, isCorrect }
                );
                
                const finishedTeams = await GameController.getFinishedTeams(id);
                const teams = await GameController.getTeams(id);

                if(teams.length == finishedTeams.length) {
                    let winner = 'Tie';

                    finishedTeams.forEach(team => { 
                        isMax = finishedTeams.find(filterTeam => team.score < filterTeam.score) == undefined;
                        isEqual = finishedTeams.find(filterTeam => 
                            team.score == filterTeam.score && filterTeam.team != team.team
                        ) == undefined;
                        
                        if(isMax && isEqual) winner = team.team;
                    });
                    
                    await GameController.finishGame(id, winner);
                    game.emit('gameOver', winner);
                    server.close();
                }else{
                    currTeam = teams.find(team => currTeam != team.teamName).teamName;
                    game.emit('setCurrentTeam', { team: currTeam });
                }
            });
        });
        
        server.listen(process.env.SOCKET_PORT);
        return process.env.SOCKET_URL + ':' + process.env.SOCKET_PORT + '/' + id;     
    }
};

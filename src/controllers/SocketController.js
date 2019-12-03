const app = require('../server');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const GameController = require('../controllers/GameController');

const teams = [
    { code: 123, name: 'A', logged: false, answeredQuestions: [] }, 
    { code: 456, name: 'B', logged: false, answeredQuestions: [] }
];
const questions = [
    {id: 1, 'question': 'Quantos e 2 + 2', 'alternatives': [1, 2, 3, 4], 'correctAnswer': 4},
    // {id: 2, 'question': 'Quantos e 2 + 3', 'alternatives': [1, 2, 3, 5], 'correctAnswer': 5},
    // {id: 3, 'question': 'Quantos e 2 + 4', 'alternatives': [1, 6, 3, 4], 'correctAnswer': 6},
    // {id: 4, 'question': 'Quantos e 2 + 5', 'alternatives': [7, 2, 3, 4], 'correctAnswer': 7}
];

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

            socket.on('sendQuestion', () => {
                const answeredQuestions = teams.find(team => team.name == currTeam).answeredQuestions;
                
                const unansweredQuestions = questions.filter(question =>
                    !answeredQuestions.find(item => item.questionId == question.id)
                );
                
                const randomIndex = Math.ceil(Math.random() * unansweredQuestions.length - 1);
                const question = unansweredQuestions[randomIndex];
                
                if(question) {
                    socket.emit('question', { question, currTeam });
                }else{
                    socket.emit('question', { question: undefined, currTeam });
                }
            });

            socket.on('verifyQuestion', data => {
                const { correctAnswer } = questions.find(question => question.id == data.questionId);
                const isCorrect = correctAnswer == data.answer;
                
                teams.map(team => { 
                    if(team.name == currTeam) {
                        team.answeredQuestions.push({ questionId: data.questionId, isCorrect });
                    }
                });
                
                const finishedTeams = [];

                teams.forEach(team => {
                    if(team.answeredQuestions.length == questions.length) {
                        const correctAnswers = team.answeredQuestions.filter(question => question.isCorrect);
                        finishedTeams.push({ team: team.name, score: correctAnswers.length });
                    }
                });

                if(teams.length == finishedTeams.length) {
                    let winner = '';

                    if(finishedTeams[0].score > finishedTeams[1].score) winner = finishedTeams[0].team;
                    else if(finishedTeams[0].score < finishedTeams[1].score) winner = finishedTeams[1].team;
                    else winner = 'Tie';
                    
                    io.sockets.emit('gameOver', winner);
                }else{
                    currTeam = teams.find(team => currTeam != team.name).name;
                    io.sockets.emit('setCurrentTeam', { team: currTeam });
                }
            });
        });
        
        server.listen(process.env.SOCKET_PORT);
        return process.env.SOCKET_URL + ':' + process.env.SOCKET_PORT + '/' + id;     
    }
};

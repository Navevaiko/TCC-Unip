const app = require('../server');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const teams = [{code: 123, name: 'A'}, {code: 456, name: 'B'}];
const questions = [
    {'question': 'Quantos e 2 + 2', 'alternatives': [1, 2, 3, 4]},
    {'question': 'Quantos e 2 + 3', 'alternatives': [1, 2, 3, 5]},
    {'question': 'Quantos e 2 + 4', 'alternatives': [1, 6, 3, 4]},
    {'question': 'Quantos e 2 + 5', 'alternatives': [7, 2, 3, 4]}
];
let currTeam = '';

module.exports = {
    createSocket() {
        io.on('connection', socket => {
            socket.on('checkPinCode', data => {
                const team = teams.find(team => team.code == data.code);

                socket.emit('checkPinCode', { isOk: true, team: team.name });
            });

            socket.on('sendQuestion', data => {
                const randomIndex = Math.ceil(Math.random() * questions.length - 1);
                const question = questions[randomIndex];
                
                socket.emit('question', question);
                currTeam = teams.find(team => currTeam != team.name);
                socket.emit('setCurrentTeam', { team: currTeam });
            });
        });
        
        server.listen(process.env.SOCKET_PORT);        
    }
};

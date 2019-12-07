const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const dotenv = require('dotenv');
const socketController = require('./controllers/SocketController');
dotenv.config();

const app = express();
const server = require('http').createServer(app);
global.io = require('socket.io')(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

server.listen(process.env.PORT);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

socketController.createSocket('2a023c75-5ef5-4240-9a24-27d1ec3ed536');
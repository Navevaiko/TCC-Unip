const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const dotenv = require('dotenv');
const socketController = require('./controllers/SocketController');

dotenv.config();

const app = express();

const io = require('socket.io')(80);

const chat = io.of('/chat').on('connection', socket => {
    console.log(socket.id);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(process.env.PORT);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

socketController.createSocket();

module.exports = app;
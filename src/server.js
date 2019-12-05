const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const dotenv = require('dotenv');
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

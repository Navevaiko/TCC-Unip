const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(process.env.PORT);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

module.exports = app;
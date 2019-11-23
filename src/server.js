const express = require('express');
const routes = require('./routes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

app.listen(process.env.PORT);
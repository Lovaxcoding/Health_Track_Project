const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // Importe le index.js du dossier routes

const app = express();

app.use(cors());
app.use(express.json());

// Utilisation du hub de routes
app.use('/api', routes); 

module.exports = app;
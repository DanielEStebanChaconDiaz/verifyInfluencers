const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const userRoute = require('./routes/userRoute');
const apiRoute = require('./routes/apiRouter');

const app = express();
const port = process.env.PORT || 3000;

// Configura CORS para permitir solicitudes de tu frontend en Netlify
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Manejando solicitudes OPTIONS de manera explícita para CORS
app.options('*', cors({
    origin:'*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/users', userRoute);
app.use('/api', apiRoute);

app.listen(port, () => {
    console.log(`Servidor funcionando en http://localhost:${port}`);
});

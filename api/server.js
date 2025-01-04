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

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true
}));

app.use('/users', userRoute);

app.use('/api', apiRoute);



app.listen(port, () => {
    console.log(`Servidor funcionando en http://localhost:${port}`);
});
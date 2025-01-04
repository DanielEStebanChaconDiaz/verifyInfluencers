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

app.get('/hola/:username', async (req, res) => {
    const username = req.params.username;

    const options = {
        method: 'GET',
        url: 'https://twitter-api47.p.rapidapi.com/v2/user/by-username',
        params: {username: username},
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'twitter-api47.p.rapidapi.com'
        }
    };

    try {
        // Obtener el ID del usuario y su información
        const userResponse = await axios.request(options);
        const userId = userResponse.data.rest_id;
        const profileImage = userResponse.data.legacy.profile_image_url_https;

        // Configurar la petición para obtener tweets
        const tweetsOptions = {
            method: 'GET',
            url: 'https://twitter-api47.p.rapidapi.com/v2/user/tweets',
            params: {userId: userId},
            headers: {
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'twitter-api47.p.rapidapi.com'
            }
        };

        // Obtener los tweets
        const tweetsResponse = await axios.request(tweetsOptions);
        
        // Extraer solo los últimos 2 tweets con la información relevante
        const lastTweets = tweetsResponse.data.tweets
            .slice(0, 2)
            .map(tweet => ({
                id: tweet.content.itemContent.tweet_results.result.rest_id,
                text: tweet.content.itemContent.tweet_results.result.legacy.full_text,
                created_at: tweet.content.itemContent.tweet_results.result.legacy.created_at
            }));

        res.json({
            username: username,
            profile_image: profileImage,
            tweets: lastTweets
        });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            error: 'Error al obtener los tweets',
            message: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor funcionando en http://localhost:${port}`);
});
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

// Define allowed origins
const allowedOrigins = [
    'https://verifyinfluencers.netlify.app',
    'http://localhost:3000',
    'http://localhost:5000'  // If you're using Vite's default port
];

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Requested-With', 'Authorization'],
    maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply routes
app.use('/users', userRoute);
app.use('/api', apiRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            error: 'CORS Error',
            message: 'This origin is not allowed to access the resource'
        });
    } else {
        next(err);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
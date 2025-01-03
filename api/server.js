// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');
const natural = require('natural'); // Biblioteca gratuita de NLP
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true
}));

// Estructura en memoria para almacenar datos (alternativa gratuita a una base de datos)
const inMemoryDB = {
    claims: [],
    influencers: new Map(),
    verifications: new Map()
};

// Función para detectar afirmaciones de salud
const detectHealthClaims = (text) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const healthKeywords = ['health', 'diet', 'nutrition', 'exercise', 'wellness', 'medical', 'cure', 'treatment'];
    
    return sentences.filter(sentence => {
        const tokens = tokenizer.tokenize(sentence.toLowerCase());
        return healthKeywords.some(keyword => tokens.includes(keyword));
    });
};

// Función para eliminar duplicados usando similitud de texto
const removeDuplicateClaims = (claims) => {
    const uniqueClaims = [];
    claims.forEach(claim => {
        const isDuplicate = uniqueClaims.some(uniqueClaim => {
            const similarity = natural.JaroWinklerDistance(claim, uniqueClaim);
            return similarity > 0.8; // Umbral de similitud
        });
        if (!isDuplicate) {
            uniqueClaims.push(claim);
        }
    });
    return uniqueClaims;
};

// Endpoint mejorado para obtener y analizar tweets
app.get('/analyze/twitter/:username', async (req, res) => {
    const username = req.params.username;
    console.log(username)
    try {
        const userResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TWITTER_TOKEN}`
            }
        });
        
        const userId = userResponse.data.data.id;
        const tweetsResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
            headers: {
                'Authorization': `Bearer ${process.env.TWITTER_TOKEN}`
            },
            params: {
                'max_results': 100,
                'tweet.fields': 'created_at,public_metrics'
            }
        });

        // Procesar tweets y extraer afirmaciones
        const tweets = tweetsResponse.data.data;
        const healthClaims = [];
        
        tweets.forEach(tweet => {
            const claims = detectHealthClaims(tweet.text);
            claims.forEach(claim => {
                healthClaims.push({
                    text: claim,
                    tweetId: tweet.id,
                    created_at: tweet.created_at,
                    metrics: tweet.public_metrics
                });
            });
        });

        // Eliminar duplicados
        const uniqueClaims = removeDuplicateClaims(healthClaims.map(c => c.text));
        
        // Almacenar en memoria
        inMemoryDB.claims.push(...uniqueClaims.map(claim => ({
            id: Math.random().toString(36).substr(2, 9),
            text: claim,
            influencer: username,
            timestamp: new Date(),
            status: 'pending'
        })));

        res.json({
            influencer: userResponse.data.data,
            claims: uniqueClaims
        });
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error en el análisis',
            details: error.response?.data || error.message
        });
    }
});

// Endpoint para verificar afirmaciones usando fuentes gratuitas
app.post('/verify/claim', async (req, res) => {
    const { claimId } = req.body;
    const claim = inMemoryDB.claims.find(c => c.id === claimId);
    
    if (!claim) {
        return res.status(404).json({ error: 'Afirmación no encontrada' });
    }

    try {
        // Usar PubMed API (gratuita) para verificación
        const pubmedSearch = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`, {
            params: {
                db: 'pubmed',
                term: claim.text,
                retmode: 'json',
                retmax: 5
            }
        });

        const verificationResult = {
            id: claimId,
            status: 'verified',
            confidence: calculateConfidence(pubmedSearch.data),
            sources: pubmedSearch.data.esearchresult.idlist
        };

        inMemoryDB.verifications.set(claimId, verificationResult);
        res.json(verificationResult);

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({ error: 'Error en la verificación' });
    }
});

// Función para calcular la confianza basada en resultados
const calculateConfidence = (searchResults) => {
    const numResults = searchResults.esearchresult.count;
    // Lógica simple de puntuación
    if (numResults > 100) return 0.9;
    if (numResults > 50) return 0.7;
    if (numResults > 10) return 0.5;
    return 0.3;
};

app.listen(port, () => {
    console.log(`Servidor funcionando en http://localhost:${port}`);
});
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Influencers = require("../models/Influencers");
const axios = require("axios");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));



// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Received registration request:", { name, email });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const user = new User({ name, email, password });
    const savedUser = await user.save();
    console.log("User saved:", savedUser);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/hola', async (req, res) => {
  try {
    const users = await Influencers.find({ twitter_handle: { $ne: null } });
    
    const transformedData = await Promise.all(users.map(async (user) => {
      const options = {
        method: 'GET',
        url: 'https://twitter-api47.p.rapidapi.com/v2/user/by-username',
        params: { username: user.twitter_handle },
        headers: {
          'x-rapidapi-key': process.env.RAPID_API_KEY,
          'x-rapidapi-host': 'twitter-api47.p.rapidapi.com',
        },
      };

      try {
        const userResponse = await axios.request(options);
        const twitterData = userResponse.data;
        
        // Calcular trustScore basado en varios factores
        const verifiedScore = twitterData.legacy.verified ? 20 : 0;
        const followersScore = Math.min(30, (twitterData.legacy.followers_count / 10000) * 2);
        const accountAgeScore = Math.min(20, ((new Date() - new Date(twitterData.legacy.created_at)) / (1000 * 60 * 60 * 24 * 365)) * 2);
        const engagementScore = Math.min(30, (twitterData.legacy.statuses_count / twitterData.legacy.followers_count) * 100);
        
        const trustScore = Math.min(100, Math.round(verifiedScore + followersScore + accountAgeScore + engagementScore));
        
        // Calcular si está trending basado en la actividad reciente
        const avgTweetsPerYear = twitterData.legacy.statuses_count / ((new Date() - new Date(twitterData.legacy.created_at)) / (1000 * 60 * 60 * 24 * 365));
        const trending = avgTweetsPerYear > 365; // Más de 1 tweet por día en promedio

        // Formatear seguidores
        const followersM = (twitterData.legacy.followers_count / 1000000).toFixed(1);
        const followers = twitterData.legacy.followers_count > 1000000 ? 
        `${followersM}M+` : 
          `${(twitterData.legacy.followers_count / 1000).toFixed(1)}K+`;
          
        // Calcular claims basado en tweets
        const claims = Math.round(twitterData.legacy.statuses_count * 0.05); // Asumimos que 5% de tweets son claims verificables

        return {
          id:twitterData.rest_id,
          username: user.twitter_handle,
          name: twitterData.legacy.name,
          category: user.category || 'Health & Wellness', // Debe venir de tu base de datos
          trustScore,
          trending,
          followers,
          claims,
          avatar: twitterData.legacy.profile_image_url_https,
          bio: twitterData.legacy.description,
          expertise: user.expertise || [], // Debe venir de tu base de datos
          yearlyRevenue:`$${(trustScore * 1000).toFixed(1)}K`, // Estimación basada en trustScore
          products:Math.floor(Math.random() * 5) + 1 // Debe venir de tu base de datos
        };

      } catch (error) {
        console.error('Error al obtener datos de usuario:', user.twitter_handle, error.message);
        return null;
      }
    }));

    const filteredData = transformedData.filter(data => data !== null);
    res.json(filteredData);
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Error al obtener los datos del influencer',
      message: error.message,
    });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = req.params.userId;
    const tweetsOptions = {
      method: 'GET',
      url: 'https://twitter-api47.p.rapidapi.com/v2/user/tweets',
      params: { userId: user },
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'twitter-api47.p.rapidapi.com'
      }
    };

    const tweetsResponse = await axios.request(tweetsOptions);
    console.log(tweetsResponse.data.tweets);

    const tweets = tweetsResponse.data.tweets
      .filter(tweet => tweet?.content?.entryType !== 'TimelineTimelineModule') // Filtra los tweets válidos
      .map(tweet => {
        const tweetResult = tweet?.content?.itemContent?.tweet_results?.result;
        const legacy = tweetResult?.legacy;

        if (!legacy) return null; // Manejo de tweets malformados

        return {
          id: tweetResult.rest_id,
          created_at: legacy.created_at,
          text: legacy.full_text,
          claim: legacy.full_text.substring(0, 100) + '...', // Primeros 100 caracteres como claim
          trustScore: Math.floor(Math.random() * 30) + 70, // Puntuación aleatoria entre 70 y 100
          verified: Boolean(tweetResult.is_blue_verified || legacy.verified),
          user: {
            name: legacy.user?.name || 'Unknown',
            username: legacy.user?.screen_name || 'Unknown',
            profile_image_url: legacy.user?.profile_image_url_https || ''
          },
          metrics: {
            retweet_count: legacy.retweet_count || 0,
            favorite_count: legacy.favorite_count || 0,
            reply_count: legacy.reply_count || 0
          },
          entities: legacy.entities || {},
          aiAnalysis: `Analysis of tweet: "${legacy.full_text.substring(0, 50)}..."`, // Análisis AI como placeholder
          hasMedia: Boolean(legacy.media?.length),
          urls: legacy.entities?.urls || []
        };
      })
      .filter(tweet => tweet !== null); // Filtra los tweets nulos

    res.json({
      tweets,
      meta: {
        total: tweets.length,
        user_id: user
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error fetching tweets',
      message: error.message
    });
  }
});

module.exports = router;

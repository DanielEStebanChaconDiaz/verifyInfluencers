const axios = require('axios');

class TwitterService {
    constructor() {
        this.rapidApiKey = process.env.RAPID_API_KEY;
        this.rapidApiHost = process.env.RAPID_API_HOST; // Asegúrate de usar el host correcto
        this.baseURL = 'https://twitter-api47.p.rapidapi.com';
        this.retryDelay = 1000; // 1 segundo entre reintentos
        this.maxRetries = 3;
    }

    async getUserTweets(username, timeRange) {
        const options = {
            method: 'GET',
            url: `${this.baseURL}/user/tweets`,
            params: {
                username: username,
                limit: '100' // Ajusta según necesidades
            },
            headers: {
                'X-RapidAPI-Key': this.rapidApiKey,
                'X-RapidAPI-Host': this.rapidApiHost
            }
        };

        let tweets = [];
        let currentTry = 0;

        while (currentTry < this.maxRetries) {
            try {
                const response = await axios.request(options);
                
                if (response.data && Array.isArray(response.data.results)) {
                    tweets = this.filterTweetsByTimeRange(
                        response.data.results,
                        timeRange
                    );
                    break; // Si todo sale bien, salimos del bucle
                }
                
            } catch (error) {
                currentTry++;
                console.error(`Attempt ${currentTry} failed:`, error.message);
                
                if (error.response) {
                    // Manejar errores específicos de la API
                    switch (error.response.status) {
                        case 429: // Rate limit
                            await this.sleep(this.retryDelay * 2);
                            continue;
                        case 404:
                            console.log(`User ${username} not found, skipping...`);
                            return [];
                        default:
                            if (currentTry === this.maxRetries) {
                                throw new Error(`Failed to fetch tweets for ${username} after ${this.maxRetries} attempts`);
                            }
                    }
                }
                
                await this.sleep(this.retryDelay);
            }
        }

        return this.processTweets(tweets);
    }

    filterTweetsByTimeRange(tweets, timeRange) {
        const startDate = this.calculateStartDate(timeRange);
        
        return tweets.filter(tweet => {
            const tweetDate = new Date(tweet.created_at);
            return tweetDate >= startDate;
        });
    }

    calculateStartDate(timeRange) {
        const now = new Date();
        switch (timeRange) {
            case 'lastWeek':
                return new Date(now.setDate(now.getDate() - 7));
            case 'lastMonth':
                return new Date(now.setMonth(now.getMonth() - 1));
            default:
                return new Date(now.setDate(now.getDate() - 7));
        }
    }

    processTweets(tweets) {
        return tweets.map(tweet => ({
            id: tweet.tweet_id,
            platform: 'twitter',
            content: this.cleanTweetContent(tweet.text),
            date: new Date(tweet.created_at),
            engagement: {
                likes: tweet.favorite_count || 0,
                retweets: tweet.retweet_count || 0,
                replies: tweet.reply_count || 0
            },
            url: `https://twitter.com/user/status/${tweet.tweet_id}`
        }));
    }

    cleanTweetContent(text) {
        return text
            .replace(/https:\/\/t\.co\/\w+/g, '') // Eliminar enlaces
            .replace(/&amp;/g, '&') // Convertir HTML entities
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new TwitterService();
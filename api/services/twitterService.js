const axios = require('axios');

class TwitterService {
    constructor() {
        this.rapidApiKey = process.env.RAPID_API_KEY;
        this.rapidApiHost = 'twitter-api47.p.rapidapi.com';
        this.baseURL = 'https://twitter-api47.p.rapidapi.com';
        this.retryDelay = 1000;
        this.maxRetries = 3;
        
        console.log('TwitterService inicializado con:', {
            host: this.rapidApiHost,
            baseURL: this.baseURL,
            apiKeyPresent: !!this.rapidApiKey
        });
    }

    async getUserId(username) {
        console.log(`\n[getUserId] Iniciando búsqueda de ID para usuario: ${username}`);
        
        const options = {
            method: 'GET',
            url: `${this.baseURL}/v2/user/by-username`,
            params: { username },
            headers: {
                'x-rapidapi-key': this.rapidApiKey,
                'x-rapidapi-host': this.rapidApiHost
            }
        };

        console.log('[getUserId] Opciones de petición:', {
            url: options.url,
            params: options.params,
            headers: {
                ...options.headers,
                'x-rapidapi-key': this.rapidApiKey ? 'PRESENTE' : 'NO PRESENTE'
            }
        });

        try {
            console.log('[getUserId] Realizando petición a la API...');
            const response = await axios.request(options);
            
            console.log('[getUserId] Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            if (response.data && response.data.rest_id) {
                console.log(`[getUserId] ID encontrado: ${response.data.rest_id}`);
                return response.data.rest_id;
            }
            
            console.error('[getUserId] Error: No se encontró rest_id en la respuesta');
            throw new Error(`Usuario ${username} no encontrado`);
        } catch (error) {
            console.error('[getUserId] Error en la petición:', {
                message: error.message,
                response: error.response ? {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                } : 'Sin respuesta',
                request: error.request ? 'Petición realizada pero sin respuesta' : 'Error antes de hacer la petición'
            });
            throw error;
        }
    }

    async getUserTweets(username, timeRange) {
        console.log(`\n[getUserTweets] Iniciando búsqueda de tweets para: ${username}`);
        
        let userid;
        try {
            userid = await this.getUserId(username);
            console.log(`[getUserTweets] ID de usuario obtenido: ${userid}`);
        } catch (error) {
            console.error(`[getUserTweets] Error obteniendo userId:`, error);
            throw error;
        }

        const options = {
            method: 'GET',
            url: `${this.baseURL}/v2/user/tweets`,
            params: {
                userId: userid,
                limit: '10'
            },
            headers: {
                'x-rapidapi-key': this.rapidApiKey,
                'x-rapidapi-host': this.rapidApiHost
            }
        };

        let tweets = [];
        let currentTry = 0;

        while (currentTry < this.maxRetries) {
            console.log(`\n[getUserTweets] Intento ${currentTry + 1} de ${this.maxRetries}`);
            
            try {
                console.log('[getUserTweets] Realizando petición a la API...');
                const response = await axios.request(options);
                
                // Log detallado de la estructura de la respuesta
                console.log('[getUserTweets] Estructura de respuesta:', {
                    status: response.status,
                    statusText: response.statusText,
                    dataKeys: Object.keys(response.data),
                    data: JSON.stringify(response.data).substring(0, 500) + '...' // Primeros 500 caracteres
                });
                
                if (response.data) {
                    // Intentar diferentes estructuras de respuesta posibles
                    if (Array.isArray(response.data)) {
                        tweets = response.data;
                        console.log('[getUserTweets] Datos recibidos como array directo');
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        tweets = response.data.data;
                        console.log('[getUserTweets] Datos recibidos en response.data.data');
                    } else if (response.data.tweets && Array.isArray(response.data.tweets)) {
                        tweets = response.data.tweets;
                        console.log('[getUserTweets] Datos recibidos en response.data.tweets');
                    } else if (response.data.results && Array.isArray(response.data.results)) {
                        tweets = response.data.results;
                        console.log('[getUserTweets] Datos recibidos en response.data.results');
                    }

                    // Log de la estructura del primer tweet si existe
                    if (tweets.length > 0) {
                        console.log('[getUserTweets] Estructura del primer tweet:', 
                            JSON.stringify(tweets[0], null, 2));
                        break;
                    }
                }
                
                console.log('[getUserTweets] No se encontró una estructura de tweets válida en la respuesta');
                throw new Error('No se encontró una estructura de tweets válida en la respuesta');

            } catch (error) {
                currentTry++;
                console.error(`[getUserTweets] Error en intento ${currentTry}:`, {
                    message: error.message,
                    response: error.response ? {
                        status: error.response.status,
                        statusText: error.response.statusText,
                        data: error.response.data
                    } : 'Sin respuesta'
                });

                if (error.response) {
                    switch (error.response.status) {
                        case 429:
                            console.log('[getUserTweets] Rate limit excedido, esperando...');
                            await this.sleep(this.retryDelay * 2);
                            continue;
                        case 404:
                            throw new Error(`Usuario ${username} no encontrado`);
                        default:
                            if (currentTry === this.maxRetries) {
                                throw new Error(`Error al obtener tweets después de ${this.maxRetries} intentos`);
                            }
                            await this.sleep(this.retryDelay);
                    }
                } else {
                    if (currentTry === this.maxRetries) {
                        throw new Error(`Error al obtener tweets después de ${this.maxRetries} intentos`);
                    }
                    await this.sleep(this.retryDelay);
                }
            }
        }

        console.log('[getUserTweets] Filtrando tweets por rango de tiempo...');
        const filteredTweets = this.filterTweetsByTimeRange(tweets, timeRange);
        console.log(`[getUserTweets] ${filteredTweets.length} tweets después del filtrado`);

        console.log('[getUserTweets] Procesando tweets...');
        const processedTweets = this.processTweets(filteredTweets);
        console.log('[getUserTweets] Tweets procesados exitosamente');

        return processedTweets;
    }

    filterTweetsByTimeRange(tweets, timeRange) {
        if (!Array.isArray(tweets)) {
            console.log('[filterTweetsByTimeRange] Input no es un array, retornando array vacío');
            return [];
        }
        
        const startDate = this.calculateStartDate(timeRange);
        console.log('[filterTweetsByTimeRange] Fecha de inicio para filtrado:', startDate);
        
        const filtered = tweets.filter(tweet => tweet.content.entryType !== "TimelineTimelineModule").filter(tweet => {
            const tweetDate = new Date(tweet.content.itemContent.tweet_results.result.legacy.created_at);
            return tweetDate >= startDate;
        });

        console.log(`[filterTweetsByTimeRange] Filtrado completado: ${filtered.length} tweets de ${tweets.length}`);
        return filtered;
    }

    calculateStartDate(timeRange) {
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
            case 'lastWeek':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'lastMonth':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }
        
        console.log(`[calculateStartDate] Fecha calculada para ${timeRange}:`, startDate);
        return startDate;
    }

    processTweets(tweets) {
        console.log('[processTweets] Iniciando procesamiento de', tweets.length, 'tweets');
        
        const processed = tweets.map(tweet => {
            const processedTweet = {
                id: tweet.content.itemContent.tweet_results.result.rest_id,
                platform: 'twitter',
                content: tweet.content.itemContent.tweet_results.result.legacy.full_text,
                date: new Date(tweet.content.itemContent.tweet_results.result.legacy.created_at),
                engagement: {
                    likes: tweet.content.itemContent.tweet_results.result.legacy.favorite_count,
                    retweets: tweet.content.itemContent.tweet_results.result.legacy.retweet_count,
                    replies: tweet.content.itemContent.tweet_results.result.legacy.reply_count
                },
                url: `https://twitter.com/user/status/${tweet.content.itemContent.tweet_results.result.rest_id}`
            };
            
            return processedTweet;
        });

        console.log('[processTweets] Procesamiento completado');
        return processed;
    }



    sleep(ms) {
        console.log(`[sleep] Esperando ${ms}ms...`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new TwitterService();
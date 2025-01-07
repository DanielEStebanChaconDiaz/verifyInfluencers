// services/influencerService.js
const twitterService = require('./twitterService');
const pubmedService = require('./pubmedService');

class InfluencerService {
    constructor() {
        this.userCache = new Map(); // Cache para evitar solicitudes duplicadas
        this.processingQueue = new Set(); // Control de usuarios en procesamiento
    }

    async getInfluencerContent(influencerName, timeRange) {
        try {
            // Verificar si el usuario está en proceso
            if (this.processingQueue.has(influencerName)) {
                throw new Error('This influencer is currently being processed');
            }

            // Verificar cache
            const cacheKey = `${influencerName}-${timeRange}`;
            if (this.userCache.has(cacheKey)) {
                return this.userCache.get(cacheKey);
            }

            this.processingQueue.add(influencerName);

            // Obtener tweets
            const tweets = await twitterService.getUserTweets(influencerName, timeRange);
            
            // Guardar en cache
            this.userCache.set(cacheKey, tweets);
            
            // Limpiar después de 5 minutos
            setTimeout(() => {
                this.userCache.delete(cacheKey);
            }, 5 * 60 * 1000);

            return tweets;
        } catch (error) {
            console.error('Error fetching influencer content:', error);
            throw error;
        } finally {
            this.processingQueue.delete(influencerName);
        }
    }

    async analyzePosts(posts) {
        const analysis = [];
        const batchSize = 5; // Procesar en lotes para evitar sobrecarga
        
        for (let i = 0; i < posts.length; i += batchSize) {
            const batch = posts.slice(i, i + batchSize);
            const batchAnalysis = await Promise.all(
                batch.map(async (post) => {
                    try {
                        const claims = await this.extractClaimsFromPost(post.content);
                        const verifiedClaims = await this.verifyClaimsWithRetry(claims, post);
                        return verifiedClaims;
                    } catch (error) {
                        console.error(`Error analyzing post ${post.id}:`, error);
                        return []; // Skip problematic posts
                    }
                })
            );
            
            analysis.push(...batchAnalysis.flat());
            
            // Pequeña pausa entre lotes
            if (i + batchSize < posts.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        return this.generateAnalysisReport(analysis);
    }

    async verifyClaimsWithRetry(claims, post, maxRetries = 3) {
        let attempts = 0;
        
        while (attempts < maxRetries) {
            try {
                const verifiedClaims = await Promise.all(
                    claims.map(async (claim) => {
                        const verification = await pubmedService.verifyMedicalClaim(claim.text);
                        return {
                            ...claim,
                            verification,
                            postId: post.id,
                            platform: post.platform,
                            engagement: post.engagement,
                            url: post.url
                        };
                    })
                );
                return verifiedClaims;
            } catch (error) {
                attempts++;
                if (attempts === maxRetries) {
                    console.error(`Failed to verify claims after ${maxRetries} attempts`);
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }
    }

    generateAnalysisReport(analysis) {
        if (analysis.length === 0) {
            return {
                summary: {
                    totalClaims: 0,
                    verifiedCount: 0,
                    verificationRate: 0,
                    averageConfidence: 0,
                    totalEngagement: {
                        likes: 0,
                        retweets: 0,
                        replies: 0
                    }
                },
                claims: [],
                platforms: ['twitter'],
                topClaims: []
            };
        }

        const verifiedClaims = analysis.filter(claim => claim.verification.verified);
        
        return {
            summary: {
                totalClaims: analysis.length,
                verifiedCount: verifiedClaims.length,
                verificationRate: (verifiedClaims.length / analysis.length) * 100,
                averageConfidence: analysis.reduce((acc, curr) => 
                    acc + curr.verification.confidence, 0) / analysis.length,
                totalEngagement: analysis.reduce((acc, curr) => ({
                    likes: acc.likes + (curr.engagement.likes || 0),
                    retweets: acc.retweets + (curr.engagement.retweets || 0),
                    replies: acc.replies + (curr.engagement.replies || 0)
                }), { likes: 0, retweets: 0, replies: 0 })
            },
            claims: analysis,
            platforms: ['twitter'],
            topClaims: analysis
                .sort((a, b) => 
                    (b.engagement.likes + b.engagement.retweets) - 
                    (a.engagement.likes + a.engagement.retweets)
                )
                .slice(0, 5)
        };
    }
}

module.exports = new InfluencerService();
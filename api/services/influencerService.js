const twitterService = require('./twitterService');
const pubmedService = require('./pubmedService');

class InfluencerService {
    constructor() {
        this.userCache = new Map(); // Cache para evitar solicitudes duplicadas
        this.processingQueue = new Set(); // Control de usuarios en procesamiento
    }

    async extractClaimsFromPost(content) {
        try {
            // Basic implementation to extract medical claims from post content
            // You might want to enhance this with more sophisticated NLP processing
            const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
            
            const claims = sentences.map(sentence => ({
                text: sentence.trim(),
                type: 'medical',
                confidence: 0.8, // Default confidence score
                source: 'text-extraction'
            }));

            return claims.filter(claim => {
                // Basic filtering of medical claims
                // You might want to add more sophisticated filtering logic
                const medicalTerms = [
                    'health', 'medical', 'disease', 'treatment', 'cure', 
                    'study', 'research', 'clinical', 'patient', 'therapy',
                    'medicine', 'drug', 'vaccine', 'symptom', 'condition'
                ];
                
                return medicalTerms.some(term => 
                    claim.text.toLowerCase().includes(term.toLowerCase())
                );
            });
        } catch (error) {
            console.error('Error extracting claims:', error);
            return [];
        }
    }

    async getInfluencerContent(influencerName, timeRange) {
        try {
            if (this.processingQueue.has(influencerName)) {
                throw new Error('This influencer is currently being processed');
            }

            const cacheKey = `${influencerName}-${timeRange}`;
            if (this.userCache.has(cacheKey)) {
                return this.userCache.get(cacheKey);
            }

            this.processingQueue.add(influencerName);

            const tweets = await twitterService.getUserTweets(influencerName, timeRange);
            
            this.userCache.set(cacheKey, tweets);
            
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
        const batchSize = 5;
        
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
                        return [];
                    }
                })
            );
            
            analysis.push(...batchAnalysis.flat());
            
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
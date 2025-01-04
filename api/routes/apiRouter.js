const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Utility function to parse date ranges
const getDateRange = (timeRange) => {
    const now = new Date();
    if (timeRange === 'lastWeek') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return lastWeek;
    }
    // lastMonth
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return lastMonth;
};

router.post('/analyze/twitter', async (req, res) => {
    const {
        influencerName,
        selectedTimeRange,
        claimsCount,
        productsCount,
        includeRevenue,
        verifyJournals,
        selectedJournals,
        notes
    } = req.body;

    const options = {
        method: 'GET',
        url: 'https://twitter-api47.p.rapidapi.com/v2/user/by-username',
        params: { username: influencerName },
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'twitter-api47.p.rapidapi.com'
        }
    };

    try {
        // Get user information
        const userResponse = await axios.request(options);
        const userId = userResponse.data.rest_id;
        const profileInfo = {
            id: userId,
            name: userResponse.data.legacy.name,
            username: userResponse.data.legacy.screen_name,
            profileImage: userResponse.data.legacy.profile_image_url_https,
            followers: userResponse.data.legacy.followers_count,
            following: userResponse.data.legacy.friends_count,
            description: userResponse.data.legacy.description
        };

        // Get tweets
        const tweetsOptions = {
            method: 'GET',
            url: 'https://twitter-api47.p.rapidapi.com/v2/user/tweets',
            params: { 
                userId: userId,
                limit: claimsCount // Use the claimsCount as limit
            },
            headers: {
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'twitter-api47.p.rapidapi.com'
            }
        };

        const tweetsResponse = await axios.request(tweetsOptions);
        const dateThreshold = getDateRange(selectedTimeRange);

        // Modified tweet processing to skip user-type entries
        const tweets = tweetsResponse.data.tweets
            .filter(tweet => {
                // First check if the tweet has the expected structure
                if (!tweet.content?.itemContent?.tweet_results?.result?.legacy) {
                    return false;
                }
                
                // Skip user-type entries and ensure it's a tweet
                if (tweet.type === 'user' || !tweet.content.itemContent.tweet_results.result.rest_id) {
                    return false;
                }

                // Check the date
                return new Date(tweet.content.itemContent.tweet_results.result.legacy.created_at) > dateThreshold;
            })
            .slice(0, claimsCount)
            .map(tweet => {
                const tweetData = tweet.content.itemContent.tweet_results.result.legacy;
                return {
                    id: tweet.content.itemContent.tweet_results.result.rest_id,
                    text: tweetData.full_text,
                    created_at: tweetData.created_at,
                    retweets: tweetData.retweet_count,
                    likes: tweetData.favorite_count,
                    claims: extractHealthClaims(tweetData.full_text),
                    products: productsCount > 0 ? extractProducts(tweetData.full_text) : [],
                    revenue: includeRevenue ? analyzeRevenue(tweetData) : null
                };
            });

        // Verify claims with scientific journals if requested
        let verifiedClaims = [];
        if (verifyJournals && selectedJournals.length > 0) {
            verifiedClaims = await verifyClaimsWithJournals(
                tweets.flatMap(t => t.claims),
                Array.from(selectedJournals)
            );
        }

        res.json({
            profile: profileInfo,
            tweets: tweets,
            verifiedClaims: verifiedClaims,
            analysisNotes: notes ? { userNotes: notes } : null
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Error analyzing Twitter content',
            message: error.message
        });
    }
});

// Utility function to extract health claims from text
function extractHealthClaims(text) {
    // Simple pattern matching for health-related claims
    const healthKeywords = [
        'health', 'wellness', 'cure', 'heal', 'treatment',
        'benefits', 'improves', 'boosts', 'prevents'
    ];
    
    const sentences = text.split(/[.!?]+/);
    return sentences
        .filter(sentence => 
            healthKeywords.some(keyword => 
                sentence.toLowerCase().includes(keyword)
            )
        )
        .map(claim => ({
            text: claim.trim(),
            confidence: calculateConfidence(claim)
        }));
}

// Utility function to extract product mentions
function extractProducts(text, limit) {
    const productPatterns = [
        /(?:check out|try|buy|get|available at) ([^.!?]+)/i,
        /(?:link in bio|shop now) for ([^.!?]+)/i,
        /\b(?:supplement|product|vitamin)\b ([^.!?]+)/i
    ];

    return productPatterns
        .flatMap(pattern => {
            const matches = text.match(pattern);
            return matches ? [matches[1].trim()] : [];
        })
        .filter(Boolean)
        .slice(0, limit); // Añadir esto para respetar el límite
}

// Utility function to analyze potential revenue
function analyzeRevenue(tweetData) {
    return {
        hasAffiliate: tweetData.full_text.toLowerCase().includes('affiliate'),
        hasSponsored: tweetData.full_text.toLowerCase().includes('sponsored'),
        engagement: {
            likes: tweetData.favorite_count,
            retweets: tweetData.retweet_count
        }
    };
}

// Utility function to calculate confidence in health claims
function calculateConfidence(claim) {
    // Simple heuristic based on presence of scientific terms
    const scientificTerms = [
        'study', 'research', 'evidence', 'clinical',
        'proven', 'scientists', 'doctors', 'published'
    ];
    
    const termCount = scientificTerms.reduce((count, term) => 
        count + (claim.toLowerCase().includes(term) ? 1 : 0), 0
    );
    
    return Math.min(termCount / scientificTerms.length, 1) * 100;
}

// Function to verify claims with scientific journals
async function verifyClaimsWithJournals(claims, journals) {
    // This would typically interface with a scientific paper API
    // For now, returning a placeholder response
    return claims.map(claim => ({
        ...claim,
        verification: {
            verified: Math.random() > 0.5,
            confidence: Math.random() * 100,
            supportingPapers: []
        }
    }));
}

module.exports = router;
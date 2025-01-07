// services/pubmedService.js
const axios = require('axios');

class PubMedService {
    constructor() {
        this.baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
        this.apiKey = process.env.PUBMED_API_KEY;
    }

    async searchArticles(query, maxResults = 5) {
        try {
            const sanitizedQuery = this.sanitizeText(query);
            
            // Búsqueda inicial para obtener IDs
            const searchUrl = `${this.baseUrl}/esearch.fcgi`;
            const searchParams = {
                db: 'pubmed',
                term: sanitizedQuery,
                retmax: maxResults,
                api_key: this.apiKey,
                retmode: 'json'
            };

            const searchResponse = await axios.get(searchUrl, { params: searchParams });
            const ids = searchResponse.data.esearchresult.idlist;

            if (ids.length === 0) {
                return [];
            }

            // Obtener detalles de los artículos
            const summaryUrl = `${this.baseUrl}/esummary.fcgi`;
            const summaryParams = {
                db: 'pubmed',
                id: ids.join(','),
                api_key: this.apiKey,
                retmode: 'json'
            };

            const summaryResponse = await axios.get(summaryUrl, { params: summaryParams });
            const articles = Object.values(summaryResponse.data.result).filter(
                article => article.uid !== undefined
            );

            return articles.map(article => ({
                id: article.uid,
                title: article.title,
                pubDate: article.pubdate,
                source: article.source,
                authors: article.authors?.map(author => author.name) || [],
                abstract: article.abstract || '',
                doi: article.elocationid || '',
                url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`
            }));
        } catch (error) {
            console.error('Error searching articles:', error);
            return [];
        }
    }

    sanitizeText(text) {
        return text
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, ' ');
    }

    async verifyMedicalClaim(claim) {
        try {
            const articles = await this.searchArticles(claim);
            const verificationResult = this.analyzeArticles(articles, claim);
            
            return {
                verified: verificationResult.isVerified,
                confidence: verificationResult.confidence,
                supportingEvidence: articles.map(article => ({
                    title: article.title,
                    url: article.url,
                    pubDate: article.pubDate,
                    relevanceScore: this.calculateRelevance(article, claim)
                })),
                lastChecked: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error verifying claim:', error);
            throw new Error('Failed to verify medical claim');
        }
    }

    analyzeArticles(articles, claim) {
        if (articles.length === 0) {
            return {
                isVerified: false,
                confidence: 0
            };
        }

        const scores = articles.map(article => {
            const ageScore = this.calculateAgeScore(article.pubDate);
            const relevanceScore = this.calculateRelevance(article, claim);
            const sourceScore = this.calculateSourceScore(article.source);
            
            return (ageScore * 0.3) + (relevanceScore * 0.5) + (sourceScore * 0.2);
        });

        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        return {
            isVerified: averageScore > 0.6,
            confidence: Math.round(averageScore * 100)
        };
    }

    calculateAgeScore(pubDate) {
        const age = new Date().getFullYear() - new Date(pubDate).getFullYear();
        return Math.max(0, 1 - (age * 0.1));
    }

    calculateRelevance(article, claim) {
        const claimWords = new Set(claim.toLowerCase().split(' '));
        const titleWords = new Set(article.title.toLowerCase().split(' '));
        const intersection = new Set([...claimWords].filter(x => titleWords.has(x)));
        return intersection.size / claimWords.size;
    }

    calculateSourceScore(source) {
        const highQualityJournals = [
            'JAMA',
            'Lancet',
            'BMJ',
            'Nature Medicine',
            'New England Journal'
        ];
        
        return highQualityJournals.some(journal => 
            source.toLowerCase().includes(journal.toLowerCase())
        ) ? 1 : 0.6;
    }
}

// Exportar una instancia única del servicio
const pubmedService = new PubMedService();
module.exports = pubmedService;
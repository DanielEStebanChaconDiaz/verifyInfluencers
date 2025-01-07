const express = require('express');
const router = express.Router();
const pubmedService = require('../services/pubmedService');

router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        
        // Extraer claims del texto
        const claims = extractClaims(text);
        
        // Verificar cada claim
        const verifiedClaims = await Promise.all(
            claims.map(async (claim) => {
                const verification = await pubmedService.verifyMedicalClaim(claim.text);
                return {
                    ...claim,
                    verification
                };
            })
        );

        res.json({
            success: true,
            data: {
                originalText: text,
                claims: verifiedClaims,
                summary: generateSummary(verifiedClaims)
            }
        });

    } catch (error) {
        console.error('Error in verification:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

function extractClaims(text) {
    const MEDICAL_KEYWORDS = [
        'treatment', 'cure', 'prevent', 'heal', 'therapy',
        'medicine', 'drug', 'symptom', 'disease', 'condition',
        'study shows', 'research indicates', 'clinical trial',
        'evidence suggests', 'scientists found'
    ];

    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    return sentences
        .filter(sentence => {
            const lowercased = sentence.toLowerCase();
            return MEDICAL_KEYWORDS.some(keyword => 
                lowercased.includes(keyword.toLowerCase())
            );
        })
        .map(sentence => ({
            text: sentence.trim(),
            type: 'medical',
            extractedDate: new Date().toISOString()
        }));
}

// Función auxiliar para generar resumen
function generateSummary(verifiedClaims) {
    const totalClaims = verifiedClaims.length;
    const verifiedCount = verifiedClaims.filter(c => c.verification.verified).length;
    
    return {
        totalClaims,
        verifiedCount,
        verificationRate: totalClaims > 0 ? (verifiedCount / totalClaims) * 100 : 0,
        averageConfidence: totalClaims > 0 
            ? verifiedClaims.reduce((acc, curr) => acc + curr.verification.confidence, 0) / totalClaims 
            : 0
    };
}

module.exports = router;
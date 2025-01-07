// routes/apiRouter.js
const express = require('express');
const router = express.Router();
const pubmedService = require('../services/pubmedService');

router.post('/analyze', async (req, res) => {
    try {
        const { 
            text, 
            verifyJournals = false,
            selectedJournals = [] 
        } = req.body;

        // Validar que text existe y es un string
        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Text is required and must be a string'
            });
        }

        // Extraer claims del texto
        const claims = extractClaims(text);
        
        // Si no hay claims para verificar, retornar resultado temprano
        if (claims.length === 0) {
            return res.json({
                success: true,
                data: {
                    originalText: text,
                    claims: [],
                    summary: {
                        totalClaims: 0,
                        verifiedCount: 0,
                        verificationRate: 0,
                        averageConfidence: 0
                    }
                }
            });
        }

        // Verificar claims solo si verifyJournals es true
        let verifiedClaims;
        if (verifyJournals && selectedJournals.length > 0) {
            verifiedClaims = await Promise.all(
                claims.map(async (claim) => {
                    try {
                        const verification = await pubmedService.verifyMedicalClaim(claim.text);
                        return {
                            ...claim,
                            verification
                        };
                    } catch (error) {
                        console.error('Error verifying claim:', error);
                        return {
                            ...claim,
                            verification: {
                                verified: false,
                                confidence: 0,
                                supportingEvidence: [],
                                error: 'Verification failed'
                            }
                        };
                    }
                })
            );
        } else {
            // Si la verificación está desactivada, retornar claims sin verificación
            verifiedClaims = claims.map(claim => ({
                ...claim,
                verification: {
                    verified: false,
                    confidence: 0,
                    supportingEvidence: [],
                    verificationSkipped: true
                }
            }));
        }

        const summary = generateSummary(verifiedClaims);

        res.json({
            success: true,
            data: {
                originalText: text,
                claims: verifiedClaims,
                summary,
                verificationEnabled: verifyJournals
            }
        });

    } catch (error) {
        console.error('Error in verification:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Función mejorada para extraer claims
function extractClaims(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const MEDICAL_KEYWORDS = [
        'treatment', 'cure', 'prevent', 'heal', 'therapy',
        'medicine', 'drug', 'symptom', 'disease', 'condition',
        'study shows', 'research indicates', 'clinical trial',
        'evidence suggests', 'scientists found'
    ];

    // Dividir el texto en oraciones de manera más robusta
    const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    return sentences
        .filter(sentence => {
            const lowercased = sentence.toLowerCase();
            return MEDICAL_KEYWORDS.some(keyword => 
                lowercased.includes(keyword.toLowerCase())
            );
        })
        .map(sentence => ({
            text: sentence,
            type: 'medical',
            extractedDate: new Date().toISOString()
        }));
}

// Función mejorada para generar resumen
function generateSummary(verifiedClaims) {
    const totalClaims = verifiedClaims.length;
    
    if (totalClaims === 0) {
        return {
            totalClaims: 0,
            verifiedCount: 0,
            verificationRate: 0,
            averageConfidence: 0
        };
    }

    const verifiedCount = verifiedClaims.filter(c => 
        c.verification && c.verification.verified
    ).length;

    const confidenceSum = verifiedClaims.reduce((acc, curr) => 
        acc + (curr.verification ? curr.verification.confidence : 0), 0
    );

    return {
        totalClaims,
        verifiedCount,
        verificationRate: (verifiedCount / totalClaims) * 100,
        averageConfidence: confidenceSum / totalClaims
    };
}

module.exports = router;
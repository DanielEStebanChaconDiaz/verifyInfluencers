const natural = require('natural');
const tokenizer = new natural.SentenceTokenizer();

const MEDICAL_KEYWORDS = [
    'treatment', 'cure', 'prevent', 'heal', 'therapy',
    'medicine', 'drug', 'symptom', 'disease', 'condition',
    'study shows', 'research indicates', 'clinical trial',
    'evidence suggests', 'scientists found'
];

function extractClaims(text) {
    const sentences = tokenizer.tokenize(text);
    
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

module.exports = {
    extractClaims
};
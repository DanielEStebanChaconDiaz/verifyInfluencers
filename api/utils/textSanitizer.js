function sanitizeText(text) {
    return text
        .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
        .trim()
        .replace(/\s+/g, ' '); // Normalizar espacios
}

module.exports = {
    sanitizeText
};

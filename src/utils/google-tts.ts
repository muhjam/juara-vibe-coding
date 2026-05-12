/**
 * Google Translate Text-to-Speech Utility
 * 
 * This provides high-quality neural voices similar to Google Translate.
 */

export const getGoogleTTSUrl = (text: string, lang: string = "en", speaker: string = "female") => {
    // Use local proxy to avoid CORS and browser restrictions
    const baseUrl = "/api/tts";
    const params = new URLSearchParams({
        text: text,
        lang: lang,
        speaker: speaker,
    });
    return `${baseUrl}?${params.toString()}`;
};

/**
 * Splits text into chunks that Google TTS can handle (usually ~200 chars)
 */
export const splitTextForTTS = (text: string, maxLength: number = 200): string[] => {
    if (text.length <= maxLength) return [text];

    const chunks: string[] = [];
    let currentChunk = "";

    // Split by sentences or punctuation first
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+/g) || [text];

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= maxLength) {
            currentChunk += sentence;
        } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            
            // If a single sentence is longer than maxLength, split by words
            if (sentence.length > maxLength) {
                const words = sentence.split(/\s+/);
                let tempChunk = "";
                for (const word of words) {
                    if ((tempChunk + " " + word).length <= maxLength) {
                        tempChunk += (tempChunk ? " " : "") + word;
                    } else {
                        if (tempChunk) chunks.push(tempChunk.trim());
                        tempChunk = word;
                    }
                }
                currentChunk = tempChunk;
            } else {
                currentChunk = sentence;
            }
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks;
};

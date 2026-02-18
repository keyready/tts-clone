const MIN_CHUNK_LENGTH = 100;

const SENTENCE_END_REGEX = /(?<=[.!?])\s+/;

/**
 * Разбивает текст на чанки по границам предложений.
 * Каждый чанк содержит не менее MIN_CHUNK_LENGTH символов (кроме последнего).
 */
export function splitTextIntoChunks(text: string, minChars = MIN_CHUNK_LENGTH): string[] {
    const trimmed = text.trim();
    if (!trimmed) return [];

    const sentences = trimmed
        .split(SENTENCE_END_REGEX)
        .map((s) => s.trim())
        .filter(Boolean);
    if (sentences.length === 0) return [trimmed];

    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
        const withSeparator = current ? `${current} ${sentence}` : sentence;
        current = withSeparator;

        if (current.length >= minChars) {
            chunks.push(current);
            current = '';
        }
    }

    if (current) {
        chunks.push(current);
    }

    return chunks;
}

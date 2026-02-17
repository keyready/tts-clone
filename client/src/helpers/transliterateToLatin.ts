export function transliterateToLatin(text: string): string {
    const ruToEnMap: Record<string, string> = {
        а: 'a',
        б: 'b',
        в: 'v',
        г: 'g',
        д: 'd',
        е: 'e',
        ё: 'yo',
        ж: 'zh',
        з: 'z',
        и: 'i',
        й: 'y',
        к: 'k',
        л: 'l',
        м: 'm',
        н: 'n',
        о: 'o',
        п: 'p',
        р: 'r',
        с: 's',
        т: 't',
        у: 'u',
        ф: 'f',
        х: 'kh',
        ц: 'ts',
        ч: 'ch',
        ш: 'sh',
        щ: 'shch',
        ъ: '',
        ы: 'y',
        ь: '',
        э: 'e',
        ю: 'yu',
        я: 'ya',
    };

    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split('')
        .map((char) => {
            const translit = ruToEnMap[char];
            if (translit !== undefined) {
                return translit;
            }

            if (/^[a-z0-9]$/.test(char)) {
                return char;
            }
            return '_';
        })
        .join('')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

export type AvailableLanguages =
    | 'chinese'
    | 'english'
    | 'japanese'
    | 'korean'
    | 'german'
    | 'french'
    | 'russian'
    | 'portuguese'
    | 'spanish'
    | 'italian';

export interface Language {
    key: AvailableLanguages;
}

export interface LanguageSchema {
    selectedLanguage?: Language;
    isLoading: boolean;
}

import type { StateSchema } from '@/store/StateSchema';

export const getSelectedLanguage = (state: StateSchema) =>
    state.language.selectedLanguage || { key: 'russian' };

import { AvailableLanguages, Language } from '../model/types/Language';

import { rtkapi } from '@/helpers/rtkapi';

const languagesApi = rtkapi.injectEndpoints({
    endpoints: (build) => ({
        getLanguages: build.query<Language[], void>({
            query: () => ({
                url: '/tts/supported-languages',
            }),
            transformResponse(res: Language[] | string[]): Language[] {
                return res
                    .filter((l) => l !== 'auto')
                    .map((l) => ({ key: l as AvailableLanguages }));
            },
        }),
    }),
});

export const useLanguages = languagesApi.useGetLanguagesQuery;

import { Voice } from '../model/types/Voice';

import { rtkapi } from '@/helpers/rtkapi';

const voicesApi = rtkapi.injectEndpoints({
    endpoints: (build) => ({
        getVoices: build.query<Voice[], void>({
            query: () => ({
                url: '/tts/voices-list',
            }),
            transformResponse(voices: string[]): Voice[] {
                return voices.map((v) => ({ voice_name: v }));
            },
        }),
    }),
});

export const useVoices = voicesApi.useGetVoicesQuery;

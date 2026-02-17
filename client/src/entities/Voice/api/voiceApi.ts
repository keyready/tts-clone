import { Voice } from '../model/types/Voice';

import { rtkapi } from '@/api/rtkapi';

const voicesApi = rtkapi.injectEndpoints({
    endpoints: (build) => ({
        getVoices: build.query<Voice[], void>({
            query: () => ({
                url: '/tts/voices-list',
            }),
            transformResponse(voices: string[]): Voice[] {
                return voices
                    .map((v) => ({ voice_name: v }))
                    .sort((a, b) => {
                        if (a.voice_name === 'russian') return 1;
                        return a.voice_name.localeCompare(b.voice_name);
                    });
            },
        }),
    }),
});

export const useVoices = voicesApi.useGetVoicesQuery;

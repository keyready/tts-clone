import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const rtkapi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://192.168.0.10:8006',
    }),
    endpoints: () => ({}),
});

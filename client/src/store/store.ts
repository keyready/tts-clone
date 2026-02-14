import { configureStore, type ReducersMapObject } from '@reduxjs/toolkit';

import { LanguageReducer } from '@/entities/Language';
import { VoiceReducer } from '@/entities/Voice';

import { createReducerManager } from './reducerManager';
import type { StateSchema } from './StateSchema';

import { $api } from '@/helpers/api';
import { rtkapi } from '@/helpers/rtkapi';

export function CreateReduxStore(
    initialState?: StateSchema,
    lazyReducers?: ReducersMapObject<StateSchema>,
) {
    const rootReducers: ReducersMapObject<StateSchema> = {
        ...lazyReducers,
        language: LanguageReducer,
        voice: VoiceReducer,
        [rtkapi.reducerPath]: rtkapi.reducer,
    };

    const reducerManager = createReducerManager(rootReducers);

    const store = configureStore({
        // @ts-expect-error bullshit
        reducer: reducerManager.reduce as ReducersMapObject<StateSchema>,
        preloadedState: initialState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: {
                        api: $api,
                    },
                },
            }).concat(rtkapi.middleware),
    });

    // @ts-expect-error bullshit
    store.reducerManager = reducerManager;

    return store;
}

export type AppDispatch = ReturnType<typeof CreateReduxStore>['dispatch'];

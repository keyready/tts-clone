import type { EnhancedStore, Reducer, ReducersMapObject, UnknownAction } from '@reduxjs/toolkit';

import type { AxiosInstance } from 'axios';

import { LanguageSchema } from '@/entities/Language';
import { VoiceSchema } from '@/entities/Voice';

import { rtkapi } from '@/helpers/rtkapi';

export interface StateSchema {
    // synchronous reducers
    language: LanguageSchema;
    voice: VoiceSchema;
    [rtkapi.reducerPath]: ReturnType<typeof rtkapi.reducer>;

    // asynchronous reducers
    //
}

export type StateSchemaKey = keyof StateSchema;
export type MountedReducers = OptionalRecord<StateSchemaKey, boolean>;
export interface reducerManager {
    getReducerMap: () => ReducersMapObject<StateSchema>;
    reduce: (state: StateSchema, action: UnknownAction) => StateSchema;
    add: (key: StateSchemaKey, reducer: Reducer) => void;
    remove: (key: StateSchemaKey) => void;
    getMountedReducers: () => MountedReducers;
}

export interface ReduxStoreWithManager extends EnhancedStore<StateSchema> {
    reducerManager: reducerManager;
}

export interface ThunkExtraArg {
    api: AxiosInstance;
}

export interface ThunkConfig<T> {
    rejectValue: T;
    extra: ThunkExtraArg;
    state: StateSchema;
}

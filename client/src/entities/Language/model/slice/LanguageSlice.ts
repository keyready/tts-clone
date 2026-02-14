import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Language, LanguageSchema } from '../types/Language';

const initialState: LanguageSchema = {
    isLoading: false,
};

export const LanguageSlice = createSlice({
    name: 'LanguageSlice',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.selectedLanguage = action.payload;
        },
    },
    extraReducers: (builder) => builder,
});

export const { reducer: LanguageReducer, actions: LanguageActions } = LanguageSlice;

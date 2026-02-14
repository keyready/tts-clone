import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Voice, VoiceSchema } from '../types/Voice';

const initialState: VoiceSchema = {};

export const VoiceSlice = createSlice({
    name: 'VoiceSlice',
    initialState,
    reducers: {
        setVoice: (state, action: PayloadAction<Voice>) => {
            state.selectedVoice = action.payload;
        },
    },
    extraReducers: (builder) => builder,
});

export const { reducer: VoiceReducer, actions: VoiceActions } = VoiceSlice;

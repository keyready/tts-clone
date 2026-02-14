import { StateSchema } from '@/store/StateSchema';

export const getSelectedVoice = (state: StateSchema) => state.voice.selectedVoice;

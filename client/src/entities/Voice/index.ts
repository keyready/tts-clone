export { getSelectedVoice } from './model/selectors/getSelectedVoice';
export { VoiceActions, VoiceReducer } from './model/slice/VoiceSlice';
export type { VoiceSchema, Voice } from './model/types/Voice';
export { useVoices } from './api/voiceApi';

export { VoiceSelector } from './ui/VoiceSelector';
export { VoicesList } from './ui/VoicesList';

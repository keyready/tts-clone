export interface Voice {
    voice_name: string;
    ref_text?: string;
}

export interface VoiceSchema {
    selectedVoice?: Voice;
}

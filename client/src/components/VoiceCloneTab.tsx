import { Button, Input, Textarea } from '@heroui/react';

import { useCallback, useState } from 'react';

import { FileInput } from '@/components/FileInput';
import { $api } from '@/helpers/api';

interface VoiceCloneTabProps {
    onVoiceCreated: (voice?: string) => void;
}

export const VoiceCloneTab = ({ onVoiceCreated }: VoiceCloneTabProps) => {
    const [refText, setRefText] = useState('');
    const [voiceRef, setVoiceRef] = useState<File | undefined>();
    const [voiceName, setVoiceName] = useState<string>('');

    const handleCreateVoice = useCallback(async () => {
        if (!voiceRef) return;

        const formData = new FormData();
        formData.append('voice', voiceRef);
        formData.append('ref_text', refText);
        formData.append('voice_name', voiceName);

        try {
            await $api.post('/tts/voice-clone', formData);
            onVoiceCreated(voiceName);
            setRefText('');
            setVoiceRef(undefined);
            alert('Голос успешно создан!');
        } catch (error) {
            console.error('Ошибка клонирования голоса:', error);
            alert('Не удалось создать голос. Проверьте файл и субтитры.');
        }
    }, [voiceRef, refText, voiceName, onVoiceCreated]);

    const handleChangeRefAudio = useCallback((file: File) => {
        setVoiceRef(file);
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <FileInput onChange={handleChangeRefAudio} />
            <Input
                isRequired
                value={voiceName}
                onValueChange={setVoiceName}
                label="Название голоса"
            />
            <Textarea
                value={refText}
                onValueChange={setRefText}
                isRequired
                label="Субтитры к аудио"
                placeholder="Введите текст расшифровки аудио"
            />
            <Button
                className="w-1/5 self-end"
                onPress={handleCreateVoice}
                isDisabled={!voiceRef || !refText.trim()}
                color="primary"
            >
                Создать голос
            </Button>
        </div>
    );
};

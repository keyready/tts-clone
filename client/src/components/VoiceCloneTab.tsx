import { addToast, Button, Input, Textarea } from '@heroui/react';

import { useCallback, useState } from 'react';

import { useVoices } from '@/entities/Voice';

import { $api } from '@/api/api';
import { FileInput } from '@/components/FileInput';

interface VoiceCloneTabProps {
    onVoiceCreated: (voice?: string) => void;
}

export const VoiceCloneTab = ({ onVoiceCreated }: VoiceCloneTabProps) => {
    const { refetch } = useVoices();

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
            refetch();
            setRefText('');
            setVoiceRef(undefined);
            addToast({
                title: 'Голос успешно склонирован',
                description: 'Теперь Вы можете использовать его для озвучки',
                color: 'success',
            });
        } catch (error) {
            console.error('Ошибка клонирования голоса:', error);
            addToast({
                title: 'Ошибка клонирования голоса',
                description: JSON.stringify(error),
                color: 'danger',
            });
        }
    }, [voiceRef, refText, voiceName, onVoiceCreated, refetch]);

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

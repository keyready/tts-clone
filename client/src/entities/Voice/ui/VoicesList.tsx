import { Alert, Button, cn } from '@heroui/react';
import { CiTrash } from 'react-icons/ci';

import { useVoices } from '@/entities/Voice';

import { $api } from '@/api/api';
import { Wavesurfer } from '@/components/Wavesurfer';

export const VoicesList = () => {
    const { data: voices = [], isLoading, isFetching, isError } = useVoices();

    if (isLoading || isFetching) {
        return <div className="text-gray-500 italic">Загрузка голосов...</div>;
    }

    if (isError) {
        return (
            <Alert color="danger" className="mt-2">
                Во время загрузки голосов произошла ошибка. Повторите позже
            </Alert>
        );
    }

    if (voices.length === 0) {
        return (
            <Alert color="warning" className="mt-2">
                Пока не создано ни одного голоса. Перейдите во вкладку &#34;Клонирование
                голоса&#34;, чтобы создать первый голос.
            </Alert>
        );
    }

    return (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
            {voices.map((voice, index) => (
                <div
                    key={index}
                    className="group relative rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-md"
                >
                    <div className="font-medium">{voice.voice_name}</div>
                    <Wavesurfer
                        generatedAudioUrl={`http://192.168.0.10:8006/voices-storage/${voice.voice_name}.mp3`}
                    />

                    <div
                        className={cn(
                            'absolute top-1/2 right-5 -translate-y-1/2 opacity-0',
                            'duration-200 group-hover:opacity-100',
                        )}
                    >
                        <Button
                            onPress={() =>
                                $api.get(`/tts/delete_voice?voice_name=${voice.voice_name}.mp3`)
                            }
                            color="danger"
                            isIconOnly
                        >
                            <CiTrash size={24} />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

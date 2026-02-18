import { addToast, Alert, Button, Input, Textarea, Tooltip } from '@heroui/react';
import { CiText } from 'react-icons/ci';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useVoices } from '@/entities/Voice';

import { $api, $whisperApi } from '@/api/api';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AudioRecording } from '@/components/AudioRecording';
import { FileInput } from '@/components/FileInput';
import { transliterateToLatin } from '@/helpers/transliterateToLatin';

interface VoiceCloneTabProps {
    onVoiceCreated: (voice?: string) => void;
}

export const VoiceCloneTab = ({ onVoiceCreated }: VoiceCloneTabProps) => {
    const { refetch } = useVoices();

    const [audioText, setAudioText] = useState('');
    const [audio, setAudio] = useState<File | undefined>();
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [description, setDescription] = useState<string>('');

    const [voiceName, setVoiceName] = useState<string>('');
    const [borders, setBorders] = useState<{ start: number; end: number }>({
        start: 0,
        end: 20,
    });

    const [isResetting, setIsResetting] = useState<boolean>(false);
    const [isTextExtracting, setIsTextExtracting] = useState<boolean>(false);
    const [isAudioCleaning, setIsAudioCleaning] = useState<boolean>(false);
    const [isRecordSelected, setIsRecordSelected] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const audioUrl = useMemo(() => {
        if (!audio) return undefined;
        const audioObj = new Audio();
        const url = URL.createObjectURL(audio);

        const onLoaded = () => {
            setAudioDuration(audioObj.duration);
            URL.revokeObjectURL(url);
        };

        audioObj.addEventListener('loadedmetadata', onLoaded);
        audioObj.src = url;

        return URL.createObjectURL(audio);
    }, [audio]);

    const handleResetFile = useCallback(() => {
        setAudio(undefined);
        setIsResetting(true);
    }, []);

    const handleCreateVoice = useCallback(async () => {
        if (!audio) return;

        let newAudio = audio;

        if (audioDuration > 20) {
            const formData = new FormData();
            formData.append('file', audio);
            formData.append('start', String(borders.start));
            formData.append('end', String(borders.end));

            const res = await $whisperApi.post('/cut_audio', formData, { responseType: 'blob' });
            newAudio = new File([res.data], new Date().getTime().toString());
            setAudio(newAudio);
        }

        const formData = new FormData();
        formData.append('voice', newAudio);
        formData.append('ref_text', audioText);
        formData.append('voice_label', transliterateToLatin(voiceName));
        formData.append('voice_name', voiceName);
        formData.append('voice_description', description);

        try {
            await $api.post('/tts/voice-clone', formData);
            onVoiceCreated(voiceName);
            refetch();
            setAudioText('');
            setAudio(undefined);
            addToast({
                title: 'Голос успешно склонирован',
                description: 'Теперь Вы можете использовать его для озвучки',
                color: 'success',
            });
        } catch (error) {
            console.error('Ошибка клонирования голоса:', error);
            addToast({
                title: 'Ошибка клонирования голоса',
                color: 'danger',
            });
        }
    }, [
        audio,
        audioDuration,
        audioText,
        voiceName,
        description,
        borders.start,
        borders.end,
        onVoiceCreated,
        refetch,
    ]);

    const handleChangeRefAudio = useCallback((file: File) => {
        setAudio(file);
        setIsRecordSelected(false);
    }, []);

    const handleAnimationComplete = useCallback(() => {
        if (isResetting && fileInputRef.current) {
            setAudio(undefined);
            setIsResetting(false);
        }
    }, [isResetting]);

    const handleEraseAudio = useCallback(async () => {
        if (!audio) {
            addToast({ title: 'Выберите файл', color: 'warning' });
            return;
        }

        const formData = new FormData();
        formData.append('file', audio);
        setIsAudioCleaning(true);

        try {
            const res = await $whisperApi.post('/extract-vocals', formData, {
                responseType: 'blob',
            });
            const blob = new File([res.data], new Date().getTime().toString());
            addToast({
                title: 'Очистили аудио!',
                description: 'Вы можете послушать результат — аудио уже заменено',
                color: 'success',
            });
            setAudio(blob);
        } catch (err) {
            addToast({ title: 'Произошла ошибка', color: 'danger' });
        } finally {
            setIsAudioCleaning(false);
        }
    }, [audio]);

    const extractText = useCallback(async () => {
        if (!audio) {
            addToast({ title: 'Выберите файл', color: 'warning' });
            return;
        }

        const formData = new FormData();
        formData.append('file', audio);
        formData.append('start', String(borders.start));
        formData.append('end', String(borders.end));
        setIsTextExtracting(true);

        try {
            const res = await $whisperApi.post('/transcribe', formData);
            setAudioText(res.data.text);
        } catch (err) {
            addToast({ title: 'Произошла ошибка', color: 'danger' });
        } finally {
            setIsTextExtracting(false);
        }
    }, [audio, borders.end, borders.start]);

    return (
        <div className="flex flex-col gap-4">
            <Alert
                variant="solid"
                color="default"
                title="Клонирование голоса"
                description={
                    'Выберите аудиозапись с образцом голоса, который Вы хотите склонировать. ' +
                    'Желательно выбирать аудио с чистым голосом, без посторонних шумов. ' +
                    'Вы можете использовать функцию "Очистить аудио", но это может несколько повлиять на качество звука'
                }
            />

            <div className="flex w-full items-center gap-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="audios-wrapper"
                        className="flex items-center gap-4 overflow-hidden"
                        initial={{ width: '100%' }}
                        animate={{
                            width: audio ? '20%' : '100%',
                            transition: { duration: 0.3, ease: 'easeInOut' },
                        }}
                    >
                        <motion.div
                            key="file-input-wrapper"
                            animate={{
                                width: isRecordSelected ? '20%' : '100%',
                                transition: { duration: 0.3, ease: 'easeInOut' },
                            }}
                        >
                            <FileInput
                                isRecordSelected={isRecordSelected}
                                ref={fileInputRef}
                                onChange={handleChangeRefAudio}
                                file={audio}
                            />
                        </motion.div>
                        {!audio && (
                            <motion.div
                                key="audio-record-wrapper"
                                animate={{
                                    width: isRecordSelected ? '80%' : 'fit',
                                    transition: { duration: 0.3, ease: 'easeInOut' },
                                }}
                            >
                                <AudioRecording
                                    onAudioSave={handleChangeRefAudio}
                                    onRecordSelected={() => setIsRecordSelected(true)}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
                    {audioUrl && (
                        <motion.div
                            key="audio-player"
                            className="overflow-hidden"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{
                                width: '80%',
                                opacity: 1,
                                transition: { duration: 0.3, ease: 'easeInOut' },
                            }}
                            exit={{
                                width: 0,
                                opacity: 0,
                                transition: { duration: 0.3, ease: 'easeInOut' },
                            }}
                        >
                            <AudioPlayer
                                onDeleteAudio={handleResetFile}
                                onAudioEraseClick={handleEraseAudio}
                                isAudioCleaning={isAudioCleaning}
                                onFileSelect={handleResetFile}
                                onBordersChange={setBorders}
                                src={audioUrl}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {audio && audioDuration > 20 && (
                <Alert
                    classNames={{ description: 'italic' }}
                    title={
                        'Используйте выделенный регион, чтобы выбрать часть аудио, на основе которой ' +
                        'будет создан голос'
                    }
                    description={
                        'Длительность аудио ограничена 20-ти секундами — это самая оптимальная ' +
                        'длительность исходного голоса'
                    }
                    color="default"
                />
            )}

            <div className="div flex w-full gap-2">
                <Input
                    classNames={{ description: 'text-bold' }}
                    isRequired
                    value={voiceName}
                    onValueChange={setVoiceName}
                    label="Название голоса"
                    isDisabled={isTextExtracting}
                    description="Можете использовать кириллицу"
                />
                <Input
                    classNames={{ description: 'text-bold' }}
                    placeholder="Например, Спокойный мужской голос"
                    value={description}
                    onValueChange={setDescription}
                    label="Описание голоса"
                    isDisabled={isTextExtracting}
                    description="Введите описание голоса, чтобы не потерять его среди сотен других"
                />
            </div>

            <Textarea
                value={audioText}
                onValueChange={setAudioText}
                isRequired
                label="Субтитры к аудио"
                placeholder="Введите текст расшифровки аудио"
                isDisabled={isTextExtracting}
                endContent={
                    <Tooltip content="Автоматически извлечь текст">
                        <Button
                            isLoading={isTextExtracting}
                            isDisabled={!audio}
                            onPress={extractText}
                            color="primary"
                            isIconOnly
                        >
                            <CiText size={24} />
                        </Button>
                    </Tooltip>
                }
            />

            <Button
                className="w-1/5 self-end"
                onPress={handleCreateVoice}
                isDisabled={!audio || !audioText.trim()}
                color="default"
            >
                Создать голос
            </Button>
        </div>
    );
};

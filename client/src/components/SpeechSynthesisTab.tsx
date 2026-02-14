import { addToast, Button, cn, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';

import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import Flag from 'react-world-flags';

import type { AvailableLanguages } from '@/entities/Language';
import { langsIconMapper, langsTransMapper, useLanguages } from '@/entities/Language';
import { useVoices } from '@/entities/Voice';

import { Wavesurfer } from '@/components/Wavesurfer';
import { $api } from '@/helpers/api';
import { type SpeechSchema, speechValidationSchema } from '@/types/SpeechValidationSchema';

export const SpeechSynthesisTab = () => {
    const [searchParams] = useSearchParams();
    const voiceFromUrl = searchParams.get('voice');

    const { data: voices = [], isLoading: isVoicesLoading } = useVoices();
    const { data: languages = [], isLoading: isLanguagesLoading } = useLanguages();

    const {
        control,
        formState: { errors, isValid },
        getValues,
        handleSubmit,
        setValue,
    } = useForm<SpeechSchema>({
        mode: 'onChange',
        resolver: yupResolver(speechValidationSchema),
    });

    const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string>('');

    const [isAudioCreating, setIsAudioCreating] = useState<boolean>(false);

    useEffect(() => {
        if (!voiceFromUrl || isVoicesLoading || voices.length === 0) return;

        const match =
            voices.find((v) => v.voice_name === voiceFromUrl) ??
            voices.find((v) => v.voice_name === `${voiceFromUrl}.mp3`) ??
            voices.find((v) => v.voice_name.replace(/\.mp3$/, '') === voiceFromUrl);

        if (match) {
            setValue('voice', match.voice_name, { shouldValidate: true });
        }
    }, [voiceFromUrl, voices, isVoicesLoading, setValue]);

    const handleSynthesize = useCallback(async (form: SpeechSchema) => {
        try {
            setIsAudioCreating(true);
            const res = await $api.post(
                '/tts/synthesize-speech',
                {
                    text: form.text,
                    language: form.language,
                    voice: form.voice,
                    streaming: false,
                    audio_filename: form.filename + '.mp3',
                },
                { responseType: 'blob' },
            );

            const blob = new Blob([res.data], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            setGeneratedAudioUrl(url);
        } catch (error) {
            console.error('Ошибка синтеза речи:', error);
            addToast({
                color: 'danger',
                title: 'Не удалось сгенерировать аудио',
                description: 'Проверьте параметры и повторите попытку',
            });
        } finally {
            setIsAudioCreating(false);
        }
    }, []);

    return (
        <form onSubmit={handleSubmit(handleSynthesize)} className="flex flex-col gap-4">
            <div className="flex gap-4">
                <Controller
                    render={({ field }) => (
                        <Select
                            label="Выберите голос озвучки"
                            placeholder="Выберите голос"
                            selectedKeys={field.value ? new Set([field.value]) : new Set()}
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys)[0];
                                field.onChange(key ?? '');
                            }}
                            items={voices}
                            isLoading={isVoicesLoading}
                            listboxProps={{
                                emptyContent: 'Нет доступных голосов',
                            }}
                            isInvalid={Boolean(errors.voice)}
                            errorMessage={errors.voice?.message}
                        >
                            {(item) => (
                                <SelectItem textValue={item.voice_name} key={item.voice_name}>
                                    {item.voice_name}
                                </SelectItem>
                            )}
                        </Select>
                    )}
                    name="voice"
                    control={control}
                />

                <Controller
                    render={({ field }) => (
                        <Select
                            startContent={
                                <Flag
                                    code={
                                        langsIconMapper[getValues('language') as AvailableLanguages]
                                    }
                                    className="h-4 w-5"
                                />
                            }
                            label="Выберите язык озвучки"
                            placeholder="Выберите язык"
                            value={field.value}
                            onChange={field.onChange}
                            items={languages}
                            isLoading={isLanguagesLoading}
                            listboxProps={{
                                emptyContent: 'Нет доступных языков',
                            }}
                            isInvalid={Boolean(errors.language)}
                            errorMessage={errors.language?.message}
                        >
                            {(item) => (
                                <SelectItem
                                    key={item.key}
                                    startContent={
                                        <Flag
                                            code={langsIconMapper[item.key]}
                                            className="h-4 w-5"
                                        />
                                    }
                                >
                                    {langsTransMapper[item.key]}
                                </SelectItem>
                            )}
                        </Select>
                    )}
                    name="language"
                    control={control}
                />
            </div>

            <Controller
                render={({ field }) => (
                    <Textarea
                        label="Текст для синтеза"
                        placeholder="Введите текст, который нужно озвучить"
                        value={field.value}
                        onValueChange={field.onChange}
                        minRows={3}
                        isRequired
                        isInvalid={Boolean(errors.text)}
                        errorMessage={errors.text?.message}
                    />
                )}
                name="text"
                control={control}
            />

            <Controller
                render={({ field }) => (
                    <Input
                        label="Имя файла"
                        placeholder="speech.mp3"
                        value={field.value}
                        onValueChange={field.onChange}
                        isRequired
                        isInvalid={Boolean(errors.filename)}
                        errorMessage={errors.filename?.message}
                    />
                )}
                name="filename"
                control={control}
            />

            <Button
                type="submit"
                color="success"
                className="w-1/5 self-end"
                isDisabled={!isValid}
                isLoading={isAudioCreating}
            >
                Синтезировать речь
            </Button>

            {generatedAudioUrl && (
                <div className="flex flex-col">
                    <div
                        className={cn(
                            'border-b border-indigo-50 bg-gradient-to-r from-indigo-50/80',
                            'to-transparent px-5 py-3',
                        )}
                    >
                        <p className="text-sm text-indigo-900/80">Результат синтеза</p>
                    </div>
                    <Wavesurfer generatedAudioUrl={generatedAudioUrl} />
                </div>
            )}
        </form>
    );
};

import { addToast, Button, Input, Textarea } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';

import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useVoices } from '@/entities/Voice';

import { $api } from '@/helpers/api';
import {
    VoiceDesignSchema,
    voiceDesignValidationSchema,
} from '@/types/VoiceCreateValidationSchema';

export const CreateVoiceTab = ({ onVoiceCreated }: { onVoiceCreated: (voice: string) => void }) => {
    const { refetch } = useVoices();

    const {
        control,
        formState: { errors, isValid },
        handleSubmit,
        reset,
    } = useForm<VoiceDesignSchema>({
        mode: 'onChange',
        resolver: yupResolver(voiceDesignValidationSchema),
        defaultValues: {
            filename: String(new Date().getTime()),
        },
    });

    const [isVoiceCreating, setIsVoiceCreating] = useState<boolean>(false);

    const handleCreateVoice = useCallback(
        async (form: VoiceDesignSchema) => {
            try {
                setIsVoiceCreating(true);
                await $api.post('/tts/voice-design', {
                    text:
                        'Банальные, но неопровержимые выводы, а также активно развивающиеся страны третьего мира ' +
                        'и по сей день остаются уделом либералов, которые жаждут быть объективно рассмотрены ' +
                        'соответствующими инстанциями.',
                    language: 'russian',
                    instruct: form.instruct,
                    voice_name: form.filename + '.mp3',
                });
                onVoiceCreated(form.filename);
            } catch (error) {
                addToast({
                    title: 'Ошибка создания голоса',
                    description: JSON.stringify(error),
                    color: 'danger',
                });
            } finally {
                setIsVoiceCreating(false);
                refetch();
                reset();
            }
        },
        [onVoiceCreated, refetch, reset],
    );

    return (
        <form onSubmit={handleSubmit(handleCreateVoice)} className="flex flex-col gap-4">
            <Controller
                render={({ field }) => (
                    <Textarea
                        label="Описание голоса"
                        value={field.value}
                        onValueChange={field.onChange}
                        minRows={3}
                        isRequired
                        isInvalid={Boolean(errors.instruct)}
                        errorMessage={errors.instruct?.message}
                    />
                )}
                name="instruct"
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
                isLoading={isVoiceCreating}
            >
                Создать голос
            </Button>
        </form>
    );
};

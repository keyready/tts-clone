import { Select, SelectItem } from '@heroui/react';
import type { Selection } from '@react-types/shared';

import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '@/hooks/useAppDispatch';

import { useVoices } from '../api/voiceApi';
import { getSelectedVoice } from '../model/selectors/getSelectedVoice';
import { VoiceActions } from '../model/slice/VoiceSlice';

export const VoiceSelector = () => {
    const { data: voices = [], isLoading, isFetching, isError } = useVoices();

    const dispatch = useAppDispatch();
    const selectedVoice = useSelector(getSelectedVoice);

    const voiceItems = voices.map((voice) => ({
        key: voice.voice_name,
        ...voice,
    }));

    const selectedKeys = selectedVoice?.voice_name
        ? new Set<string>([selectedVoice.voice_name])
        : new Set<string>();

    const handleSelectionChange = useCallback(
        (keys: Selection) => {
            const [key] = keys;
            if (key) {
                dispatch(VoiceActions.setVoice({ voice_name: key as string }));
            }
        },
        [dispatch],
    );

    return (
        <Select
            label="Выберите голос озвучки"
            placeholder="Выберите голос"
            selectedKeys={selectedKeys}
            onSelectionChange={handleSelectionChange}
            items={voiceItems}
            isLoading={isLoading || isFetching}
            isInvalid={isError}
            errorMessage={isError ? 'Ошибка загрузки голосов' : ''}
            listboxProps={{
                emptyContent: 'Нет доступных языков',
            }}
        >
            {(item) => (
                <SelectItem description="Описани евыбранного голоса" key={item.key}>
                    {item.voice_name}
                </SelectItem>
            )}
        </Select>
    );
};

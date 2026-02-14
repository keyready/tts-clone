import { Select, SelectItem } from '@heroui/react';
import type { Selection } from '@react-types/shared';

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Flag from 'react-world-flags';

import { useLanguages } from '../api/LanguageApi';
import { langsIconMapper, langsTransMapper } from '../model/consts/languages';
import { getSelectedLanguage } from '../model/selectors/getSelectedLanguage';
import { LanguageActions } from '../model/slice/LanguageSlice';

import type { AvailableLanguages } from '../model/types/Language';

import { useAppDispatch } from '@/hooks/useAppDispatch';

export const LanguageSelector = () => {
    const { data: languages = [], isLoading, isFetching, isError } = useLanguages();
    const dispatch = useAppDispatch();
    const selectedLanguage = useSelector(getSelectedLanguage);

    const languageItems = languages.map((lang) => ({
        key: lang.key,
    }));

    const selectedKeys = selectedLanguage?.key
        ? new Set<string>([selectedLanguage.key])
        : new Set<string>();

    const handleSelectionChange = useCallback(
        (keys: Selection) => {
            const [key] = keys;
            if (key) {
                dispatch(LanguageActions.setLanguage({ key: key as AvailableLanguages }));
            }
        },
        [dispatch],
    );

    return (
        <Select
            label="Выберите язык озвучки"
            placeholder="Выберите язык"
            selectedKeys={selectedKeys}
            onSelectionChange={handleSelectionChange}
            items={languageItems}
            isLoading={isLoading || isFetching}
            isInvalid={isError}
            errorMessage={isError ? 'Ошибка загрузки языков' : ''}
            listboxProps={{
                emptyContent: 'Нет доступных голосов',
            }}
        >
            {(item) => (
                <SelectItem
                    key={item.key}
                    startContent={<Flag code={langsIconMapper[item.key]} className="h-4 w-5" />}
                >
                    {langsTransMapper[item.key]}
                </SelectItem>
            )}
        </Select>
    );
};

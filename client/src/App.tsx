import { Tab, Tabs } from '@heroui/react';
import type { Key } from '@react-types/shared';

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { VoicesList } from '@/entities/Voice';

import { CreateVoiceTab } from '@/components/CreateVoiceTab';
import { SpeechSynthesisTab } from '@/components/SpeechSynthesisTab';
import { VoiceCloneTab } from '@/components/VoiceCloneTab';

const PATH_TO_TAB: Record<string, Key> = {
    '/': 'voice_clone',
    '/voice-clone': 'voice_clone',
    '/voice-design': 'voice_design',
    '/speech-synthesis': 'speech_synthesis',
    '/available-voices': 'available_voices',
};

const TAB_TO_PATH: Record<string, string> = {
    voice_clone: '/voice-clone',
    voice_design: '/voice-design',
    speech_synthesis: '/speech-synthesis',
    available_voices: '/available-voices',
};

export default function App() {
    const location = useLocation();
    const navigate = useNavigate();

    const pathname = location.pathname || '/';
    const activeTab = PATH_TO_TAB[pathname] ?? 'voice_clone';

    useEffect(() => {
        if (!(pathname in PATH_TO_TAB)) {
            navigate('/voice-clone', { replace: true });
        }
    }, [pathname, navigate]);

    const handleTabChange = useCallback(
        (key: Key | null | undefined) => {
            const path = key ? TAB_TO_PATH[String(key)] : '/voice-clone';
            if (path) {
                navigate(path);
            }
        },
        [navigate],
    );

    const handleVoiceCreated = useCallback(
        (voice?: string) => {
            const params = voice ? `?voice=${encodeURIComponent(voice)}` : '';
            navigate(`/speech-synthesis${params}`);
        },
        [navigate],
    );

    return (
        <section className="min-h-screen w-full bg-gradient-to-br from-amber-500 to-rose-500 p-6 md:p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-center text-2xl font-bold text-gray-800 md:text-3xl">
                    Система клонирования голоса и синтеза речи
                </h1>

                <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={handleTabChange}
                    classNames={{
                        tabList: 'gap-2',
                        tab: 'px-4 py-2',
                        panel: 'py-6',
                    }}
                >
                    <Tab key="speech_synthesis" title="Синтез речи">
                        <SpeechSynthesisTab />
                    </Tab>
                    <Tab key="voice_clone" title="Клонирование голоса">
                        <VoiceCloneTab onVoiceCreated={handleVoiceCreated} />
                    </Tab>
                    <Tab key="voice_design" title="Создание голоса">
                        <CreateVoiceTab onVoiceCreated={handleVoiceCreated} />
                    </Tab>

                    <Tab className="hidden" key="available_voices" title="Доступные голоса">
                        <VoicesList />
                    </Tab>
                </Tabs>
            </div>
        </section>
    );
}

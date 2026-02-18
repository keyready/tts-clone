import { addToast, Button, ButtonGroup, Tooltip } from '@heroui/react';
import WavesurferPlayer from '@wavesurfer/react';
import { CiEraser, CiPause1, CiPlay1, CiTrash } from 'react-icons/ci';
import { HiOutlineUpload } from 'react-icons/hi';
import RegionsPlugin from 'wavesurfer.js/plugins/regions';

import { useCallback, useMemo, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
    src: string;
    onFileSelect?: () => void;
    onAudioEraseClick?: () => void;
    onDeleteAudio?: () => void;
    isAudioCleaning?: boolean;
    onBordersChange?: ({ start, end }: { start: number; end: number }) => void;
}

export const AudioPlayer = (props: AudioPlayerProps) => {
    const {
        src,
        onFileSelect,
        onDeleteAudio,
        onAudioEraseClick,
        onBordersChange,
        isAudioCleaning,
    } = props;

    const [isPlaying, setIsPlaying] = useState(false);

    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

    const plugins = useMemo(() => {
        return [RegionsPlugin.create()] as const satisfies [RegionsPlugin];
    }, []);

    const onPlayerReady = useCallback(
        (ws: WaveSurfer) => {
            setWavesurfer(ws);

            if (ws.getDuration() > 20) {
                plugins[0].addRegion({
                    start: 0,
                    end: Math.min(ws.getDuration(), 20),
                    color: 'rgba(70,229,115,0.32)',
                    content: `20 сек`,
                    drag: true,
                    resize: false,
                });

                plugins[0].on('region-updated', (ev) => {
                    ws.seekTo(ev.start / ws.getDuration());
                    onBordersChange?.({
                        start: ev.start,
                        end: ev.end,
                    });
                });

                plugins[0].on('region-out', (region) => {
                    region.play();
                });
            }
        },
        [onBordersChange, plugins],
    );

    const handleRestoreVolume = useCallback(() => {
        wavesurfer?.setVolume(1);
        addToast({
            color: 'success',
            title: 'Вернули как было',
            description: 'И больше так обещаем не делать...',
        });
        localStorage.setItem('decrease_volume', 'false');
    }, [wavesurfer]);

    const handleControlsClick = useCallback(() => {
        if (isPlaying) {
            setIsPlaying(false);
            wavesurfer?.pause();
        } else {
            if (!localStorage.getItem('decrease_volume')) {
                wavesurfer?.setVolume(0.2);
                addToast({
                    color: 'default',
                    severity: 'warning',
                    title: 'Мы сделали звук потише',
                    description:
                        'Поставили громкость воспроизведения на 20%, чтобы никого не напугать',
                    classNames: {
                        base: 'flex flex-col gap-2',
                    },
                    endContent: (
                        <ButtonGroup className="w-4/5 justify-center">
                            <Button color="success" size="sm" className="w-full">
                                Спасибо!
                            </Button>
                            <Button
                                onPress={handleRestoreVolume}
                                color="danger"
                                size="sm"
                                className="w-full"
                            >
                                Не надо...
                            </Button>
                        </ButtonGroup>
                    ),
                });
            }

            setIsPlaying(true);
            wavesurfer?.play();
        }
    }, [handleRestoreVolume, isPlaying, wavesurfer]);

    return (
        <div className="bg-default-100 flex gap-2 rounded-xl p-3 shadow-xs">
            <Button
                isIconOnly
                size="lg"
                className={
                    isPlaying
                        ? 'bg-amber-100 text-amber-700 shadow-sm'
                        : 'bg-indigo-100 text-indigo-700 shadow-sm'
                }
                onPress={handleControlsClick}
            >
                {isPlaying ? (
                    <CiPause1 size={28} className="shrink-0" />
                ) : (
                    <CiPlay1 size={28} className="ml-0.5 shrink-0" />
                )}
            </Button>

            <div className="w-full pl-5">
                <WavesurferPlayer
                    barWidth={2}
                    barGap={1}
                    barRadius={1}
                    cursorWidth={2}
                    height={50}
                    progressColor="#4f46e5"
                    waveColor="#94a3b8"
                    url={src}
                    onReady={onPlayerReady}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    plugins={plugins}
                />
            </div>

            <Button
                isIconOnly
                size="lg"
                className="hidden bg-indigo-100 text-indigo-700 shadow-sm"
                onPress={onFileSelect}
            >
                <HiOutlineUpload size={28} className="ml-0.5 shrink-0" />
            </Button>

            <Tooltip content="Очистить аудио от посторонних звуков">
                <Button
                    isIconOnly
                    size="lg"
                    color="primary"
                    onPress={onAudioEraseClick}
                    isLoading={isAudioCleaning}
                >
                    <CiEraser size={28} className="shrink-0" />
                </Button>
            </Tooltip>

            <Tooltip content="Удалить аудио">
                <Button isIconOnly size="lg" color="danger" onPress={onDeleteAudio}>
                    <CiTrash size={28} className="shrink-0" />
                </Button>
            </Tooltip>
        </div>
    );
};

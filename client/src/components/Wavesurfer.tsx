import { Button, Tooltip } from '@heroui/react';
import WavesurferPlayer from '@wavesurfer/react';
import {
    CiPause1,
    CiPlay1,
    CiSaveDown2,
    CiVolume,
    CiVolumeHigh,
    CiVolumeMute,
} from 'react-icons/ci';

import { useCallback, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const Wavesurfer = ({ generatedAudioUrl }: { generatedAudioUrl: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const onPlayerReady = useCallback((ws: WaveSurfer) => {
        setWavesurfer(ws);
        setDuration(ws.getDuration());
    }, []);

    useEffect(() => {
        if (!wavesurfer) return;

        const unsubTimeupdate = wavesurfer.on('timeupdate', (t: number) => setCurrentTime(t));
        const unsubDecode = wavesurfer.on('decode', () => setDuration(wavesurfer.getDuration()));
        const unsubFinish = wavesurfer.on('finish', () => {
            setIsPlaying(false);
            setCurrentTime(0);
        });

        return () => {
            unsubTimeupdate();
            unsubDecode();
            unsubFinish();
        };
    }, [wavesurfer]);

    const handleControlsClick = useCallback(() => {
        if (isPlaying) {
            setIsPlaying(false);
            wavesurfer?.pause();
        } else {
            setIsPlaying(true);
            wavesurfer?.play();
        }
    }, [isPlaying, wavesurfer]);

    const handleMute = useCallback(() => {
        wavesurfer?.setMuted(!wavesurfer?.getMuted());
    }, [wavesurfer]);

    const handleDownload = useCallback(() => {
        const link = document.createElement('a');
        link.href = generatedAudioUrl;
        link.download = `speech-${Date.now()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [generatedAudioUrl]);

    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-white/90">
            <div className="p-5">
                <div className="mb-4 overflow-hidden rounded-xl bg-slate-50/80 p-2 ring-1 ring-slate-200/60">
                    <WavesurferPlayer
                        barWidth={2}
                        barGap={1}
                        barRadius={1}
                        cursorWidth={2}
                        height={100}
                        progressColor="#4f46e5"
                        waveColor="#94a3b8"
                        url={generatedAudioUrl}
                        onReady={onPlayerReady}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
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

                    <span className="min-w-[4.5rem] font-mono text-sm text-slate-600 tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div className="ml-auto flex items-center gap-1">
                        <Tooltip
                            content={wavesurfer?.getMuted() ? 'Включить звук' : 'Выключить звук'}
                        >
                            <Button
                                isIconOnly
                                variant="flat"
                                size="sm"
                                className={wavesurfer?.getMuted() ? 'bg-rose-500' : 'bg--slate-500'}
                                onPress={handleMute}
                            >
                                <CiVolumeMute size={20} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Уменьшить громкость">
                            <Button
                                isIconOnly
                                variant="flat"
                                size="sm"
                                className="text-slate-500"
                                onPress={() =>
                                    wavesurfer?.setVolume(
                                        Math.max((wavesurfer?.getVolume() ?? 1) - 0.2, 0),
                                    )
                                }
                            >
                                <CiVolume size={20} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Добавить громкость">
                            <Button
                                isIconOnly
                                variant="flat"
                                size="sm"
                                className="text-slate-500"
                                onPress={() =>
                                    wavesurfer?.setVolume(
                                        Math.min((wavesurfer?.getVolume() ?? 1) + 0.2, 1),
                                    )
                                }
                            >
                                <CiVolumeHigh size={20} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Скачать MP3">
                            <Button
                                color="secondary"
                                size="sm"
                                startContent={<CiSaveDown2 size={18} />}
                                onPress={handleDownload}
                            >
                                Скачать
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};

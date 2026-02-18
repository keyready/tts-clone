import { Button, Tooltip } from '@heroui/react';
import { CiPause1, CiPlay1, CiVolume, CiVolumeHigh, CiVolumeMute } from 'react-icons/ci';

import { useCallback, useEffect, useRef, useState } from 'react';

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

type ScheduledChunk = { startTime: number; duration: number };

export const StreamingAudioPlayer = ({
    chunks,
    totalChunks,
}: {
    chunks: Map<number, Blob>;
    totalChunks: number;
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const contextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const scheduledRef = useRef<ScheduledChunk[]>([]);
    const nextToScheduleRef = useRef(0);
    const lastScheduledEndRef = useRef(0);
    const animationRef = useRef<number>(0);

    const processChunks = useCallback(async () => {
        const ctx = contextRef.current;
        const gain = gainNodeRef.current;
        if (!ctx || !gain) return;

        while (chunks.has(nextToScheduleRef.current)) {
            const index = nextToScheduleRef.current;
            const blob = chunks.get(index)!;

            try {
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }

                const arrayBuffer = await blob.arrayBuffer();
                const buffer = await ctx.decodeAudioData(arrayBuffer);
                const duration = buffer.duration;

                const startTime = Math.max(lastScheduledEndRef.current, ctx.currentTime);
                lastScheduledEndRef.current = startTime + duration;
                scheduledRef.current.push({ startTime, duration });

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(gain);
                source.start(startTime);

                nextToScheduleRef.current++;
                setTotalDuration((d) => d + duration);

                if (index === 0) {
                    setIsPlaying(true);
                }
            } catch (e) {
                console.error('Ошибка декодирования чанка:', e);
                nextToScheduleRef.current++;
            }
        }
    }, [chunks]);

    useEffect(() => {
        processChunks();
    }, [processChunks]);

    useEffect(() => {
        contextRef.current = new AudioContext();
        gainNodeRef.current = contextRef.current.createGain();
        gainNodeRef.current.connect(contextRef.current.destination);
        gainNodeRef.current.gain.value = 1;

        return () => {
            contextRef.current?.close();
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const updateCurrentTime = useCallback(() => {
        const ctx = contextRef.current;
        if (!ctx || scheduledRef.current.length === 0) return;

        const now = ctx.currentTime;
        let pos = 0;
        let found = false;

        for (const { startTime, duration } of scheduledRef.current) {
            if (now < startTime + duration) {
                pos += now - startTime;
                found = true;
                break;
            }
            pos += duration;
        }

        if (found || pos > 0) {
            setCurrentTime(pos);
        }
        if (
            pos >= totalDuration &&
            totalDuration > 0 &&
            scheduledRef.current.length === totalChunks
        ) {
            setIsPlaying(false);
        }
    }, [totalDuration, totalChunks]);

    useEffect(() => {
        if (!isPlaying) return;

        const tick = () => {
            updateCurrentTime();
            animationRef.current = requestAnimationFrame(tick);
        };
        animationRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying, updateCurrentTime]);

    const handlePlayPause = useCallback(async () => {
        const ctx = contextRef.current;
        const gain = gainNodeRef.current;
        if (!ctx || !gain) return;

        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        if (isPlaying) {
            gain.gain.setTargetAtTime(0, ctx.currentTime, 0.01);
            setIsPlaying(false);
        } else {
            gain.gain.setTargetAtTime(isMuted ? 0 : volume, ctx.currentTime, 0.01);
            setIsPlaying(true);
        }
    }, [isPlaying, isMuted, volume]);

    const handleMute = useCallback(() => {
        const ctx = contextRef.current;
        const gain = gainNodeRef.current;
        if (!ctx || !gain) return;

        const nextMuted = !isMuted;
        gain.gain.setTargetAtTime(nextMuted ? 0 : volume, ctx.currentTime, 0.01);
        setIsMuted(nextMuted);
    }, [isMuted, volume]);

    const handleVolumeDown = useCallback(() => {
        const v = Math.max(0, volume - 0.2);
        setVolume(v);
        const ctx = contextRef.current;
        const gain = gainNodeRef.current;
        if (ctx && gain && !isMuted) {
            gain.gain.setTargetAtTime(v, ctx.currentTime, 0.01);
        }
    }, [volume, isMuted]);

    const handleVolumeUp = useCallback(() => {
        const v = Math.min(1, volume + 0.2);
        setVolume(v);
        const ctx = contextRef.current;
        const gain = gainNodeRef.current;
        if (ctx && gain && !isMuted) {
            gain.gain.setTargetAtTime(v, ctx.currentTime, 0.01);
        }
    }, [volume, isMuted]);

    const hasFirstChunk = chunks.has(0);

    if (!hasFirstChunk) return null;

    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/50">
            <div className="p-5">
                <p className="mb-4 text-sm text-amber-800/80">
                    Воспроизведение по мере генерации ({chunks.size}/{totalChunks} чанков)
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        isIconOnly
                        size="lg"
                        className={
                            isPlaying
                                ? 'bg-amber-100 text-amber-700 shadow-sm'
                                : 'bg-indigo-100 text-indigo-700 shadow-sm'
                        }
                        onPress={handlePlayPause}
                    >
                        {isPlaying ? (
                            <CiPause1 size={28} className="shrink-0" />
                        ) : (
                            <CiPlay1 size={28} className="ml-0.5 shrink-0" />
                        )}
                    </Button>
                    <span className="min-w-[4.5rem] font-mono text-sm text-slate-600 tabular-nums">
                        {formatTime(currentTime)} / {formatTime(totalDuration) || '…'}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                        <Tooltip content={isMuted ? 'Включить звук' : 'Выключить звук'}>
                            <Button
                                isIconOnly
                                variant="flat"
                                size="sm"
                                className={isMuted ? 'bg-rose-500' : 'bg-slate-500'}
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
                                onPress={handleVolumeDown}
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
                                onPress={handleVolumeUp}
                            >
                                <CiVolumeHigh size={20} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};

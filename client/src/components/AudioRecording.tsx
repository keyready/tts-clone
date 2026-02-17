import { addToast, Alert, Button, cn, Select, SelectItem } from '@heroui/react';
import WavesurferPlayer from '@wavesurfer/react';
import { BsStopFill } from 'react-icons/bs';
import { CiMicrophoneOn } from 'react-icons/ci';
import { FaPause, FaPlay } from 'react-icons/fa';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

import { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { selectMicrophone } from '@/helpers/selectMicrofone';

interface AudioRecordingProps {
    onAudioSave: (file: File) => void;
    onRecordSelected: () => void;
    isRecordSelected: boolean;
}

export const AudioRecording = ({
    onAudioSave,
    onRecordSelected,
    isRecordSelected,
}: AudioRecordingProps) => {
    const wsRef = useRef<WaveSurfer | null>(null);
    const recordRef = useRef<RecordPlugin | null>(null);

    const [isCertError, setIsCertError] = useState<boolean>(false);
    const [isMicSelected, setIsMicSelected] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [recordTime, setRecordTime] = useState<string>('0');
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => navigator.mediaDevices.enumerateDevices())
            .then((devs) => setDevices(devs.filter((d) => d.kind === 'audioinput')))
            .catch(() => {
                setIsCertError(true);
                addToast({ color: 'danger', title: 'Нет доступа к микрофону' });
            });
    }, []);

    const handleInit = useCallback(
        (ws: WaveSurfer) => {
            wsRef.current = ws;

            const record = wsRef.current.registerPlugin(
                RecordPlugin.create({
                    scrollingWaveform: false,
                    continuousWaveform: false,
                    continuousWaveformDuration: wsRef.current.getDuration(),
                }),
            );

            if (!record) return;
            recordRef.current = record;

            record.on('record-start', () => setIsRecording(true));
            record.on('record-progress', (time: number) => setRecordTime((time / 1000).toFixed(2)));
            record.on('record-end', (blob: Blob) => {
                setIsRecording(false);
                const file = new File([blob], `recording-${Date.now()}.webm`, { type: blob.type });
                onAudioSave(file);
            });
        },
        [onAudioSave],
    );

    const handleStartStopRecording = useCallback(async () => {
        setIsMicSelected(true);
        onRecordSelected();

        const record = wsRef.current?.getActivePlugins()[0] as RecordPlugin;
        if (!record) {
            console.log('record not ready');
            return;
        }

        if (isRecording) {
            console.log(record.stopRecording());
        } else {
            await record.startRecording();
        }
    }, [isRecording, onRecordSelected]);

    const handlePlayPause = useCallback(async () => {
        if (!wsRef.current) return;
        await wsRef.current.playPause();
        wsRef.current.setVolume(0.5);
    }, []);

    return (
        <div
            className={cn(
                'flex flex-col items-center gap-4',
                'bg-default-100 rounded-xl px-6 py-6 shadow-sm',
            )}
        >
            {isCertError && (
                <Alert
                    color="danger"
                    title="Проблема с доступом"
                    description="Нет доступа к микрофону."
                />
            )}

            {isMicSelected ? (
                <div className="flex w-full flex-col gap-5">
                    <div className="flex w-full items-center gap-5">
                        <div className="bg-default-200 min-h-[100px] w-full rounded-lg">
                            <WavesurferPlayer
                                url="/file.mp3"
                                height={100}
                                waveColor="#4F46E5"
                                progressColor="#3730A3"
                                barWidth={2}
                                barRadius={3}
                                normalize={false}
                                interact
                                onReady={handleInit}
                            />
                        </div>

                        <div className="flex w-1/6 flex-col items-center gap-2">
                            <Button
                                isIconOnly
                                size="lg"
                                color={isRecording ? 'danger' : 'primary'}
                                onPress={handleStartStopRecording}
                            >
                                {isRecording ? (
                                    <BsStopFill size={24} />
                                ) : (
                                    <CiMicrophoneOn size={28} />
                                )}
                            </Button>

                            {isRecording && (
                                <div className="text-danger font-mono text-sm">
                                    ● {recordTime} с
                                </div>
                            )}

                            {!isRecording && (
                                <Button
                                    isIconOnly
                                    size="lg"
                                    variant="flat"
                                    onPress={handlePlayPause}
                                >
                                    {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Select
                        className="hidden"
                        label="Устройство ввода"
                        items={devices}
                        onChange={(ev) => selectMicrophone(ev.target.value)}
                    >
                        {(item) => <SelectItem key={item.deviceId}>{item.label}</SelectItem>}
                    </Select>
                </div>
            ) : (
                <Button isIconOnly size="lg" color="primary" onPress={handleStartStopRecording}>
                    <CiMicrophoneOn size={28} />
                </Button>
            )}
        </div>
    );
};

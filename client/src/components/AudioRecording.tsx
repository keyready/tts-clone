import { Alert, Button, cn, Select, SelectItem, Tooltip } from '@heroui/react';
import WavesurferPlayer from '@wavesurfer/react';
import { BsStopFill } from 'react-icons/bs';
import { CiMicrophoneOn } from 'react-icons/ci';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

import { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { formatTime } from '@/helpers/formarMs';
import { selectMicrophone } from '@/helpers/selectMicrofone';

interface AudioRecordingProps {
    onAudioSave: (file: File) => void;
    onRecordSelected: () => void;
}

export const AudioRecording = ({ onAudioSave, onRecordSelected }: AudioRecordingProps) => {
    const wsRef = useRef<WaveSurfer | null>(null);
    const recordRef = useRef<RecordPlugin | null>(null);

    const [isCertError, setIsCertError] = useState<boolean>(false);
    const [isMicSelected, setIsMicSelected] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordTime, setRecordTime] = useState<number>(0);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        try {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => navigator.mediaDevices.enumerateDevices())
                .then((devs) => setDevices(devs.filter((d) => d.kind === 'audioinput')));
        } catch {
            setIsCertError(true);
        }
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
            record.on('record-progress', setRecordTime);
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

        // небольшая маломестная габаритная инвалидная коляска, чтобы поместить туда
        // полумертвую портовую шлюху (мать разработчика @wavesurfer/react)
        // чтобы ей было более комфортно перемещаться к месту назначения (канаве с дерьмом и мочой)
        await new Promise((res) => setTimeout(() => res(true), 500));

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

    if (isCertError) {
        return (
            <Alert
                color="danger"
                title="Проблема с доступом"
                description="Нет доступа к микрофону."
            />
        );
    }

    return (
        <div
            className={cn(
                'flex flex-col items-center gap-4',
                'bg-default-100 rounded-xl px-6 py-6 shadow-sm',
            )}
        >
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

                        <div className="flex w-1/4 flex-col items-center gap-2">
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
                                    ● {formatTime(recordTime)} с
                                </div>
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
                <Tooltip content="Записать с микрофона">
                    <Button isIconOnly size="lg" color="primary" onPress={handleStartStopRecording}>
                        <CiMicrophoneOn size={28} />
                    </Button>
                </Tooltip>
            )}
        </div>
    );
};

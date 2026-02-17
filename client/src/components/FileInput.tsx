import { addToast, cn } from '@heroui/react';
import { HiOutlineUpload } from 'react-icons/hi';

import { ChangeEvent, DragEvent, forwardRef, useCallback, useEffect, useState } from 'react';

interface FileInputProps {
    file: File | undefined;
    onChange: (f: File) => void;
    isRecordSelected?: boolean;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>((props, ref) => {
    const { isRecordSelected, onChange, file } = props;

    const [isDraggableFileSatisfied, setIsDraggableFileSatisfied] = useState<
        'sat' | 'nsat' | 'null'
    >('null');

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) {
                addToast({ color: 'danger', title: 'Буфер обмена пуст' });
                return;
            }

            const hasFiles = Array.from(items).some((item) => item.kind === 'file');
            if (!hasFiles) {
                addToast({ color: 'danger', title: 'В буфере обмена нет файлов' });
                return;
            }

            e.preventDefault();

            let wavFile: File | null = null;
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file') {
                    const file = items[i].getAsFile();
                    if (
                        file &&
                        ['audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mpeg'].includes(file.type)
                    ) {
                        wavFile = file;
                        addToast({ color: 'success', title: 'Вставили файл из буфера' });
                        break;
                    }
                }
            }

            if (wavFile) {
                onChange(wavFile);
                setIsDraggableFileSatisfied('null');
            } else {
                setIsDraggableFileSatisfied('nsat');
                const timer = setTimeout(() => {
                    setIsDraggableFileSatisfied('null');
                }, 2000);
                addToast({ color: 'danger', title: 'Скопируйте (.wav/.mp3/.ogg)-файл' });
                return () => clearTimeout(timer);
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [onChange]);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const items = e.dataTransfer.items;
        if (items.length > 0) {
            const item = items[0];
            setIsDraggableFileSatisfied(
                ['audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mpeg'].includes(item.type)
                    ? 'sat'
                    : 'nsat',
            );
        }
    };

    const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggableFileSatisfied('null');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (['audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mpeg'].includes(file.type)) {
                const input = document.getElementById('file-input') as HTMLInputElement;
                if (input) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                setIsDraggableFileSatisfied('nsat');
                setTimeout(() => setIsDraggableFileSatisfied('null'), 2000);
            }
        }
    };

    const handleChangeFile = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            ev.preventDefault();
            const file = ev.target.files?.[0];
            if (file && ['audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mpeg'].includes(file.type)) {
                onChange(file);
            } else if (file) {
                setIsDraggableFileSatisfied('nsat');
                setTimeout(() => setIsDraggableFileSatisfied('null'), 2000);
            }
        },
        [onChange],
    );

    return (
        <label htmlFor="file-input" className="w-full">
            <input
                id="file-input"
                onChange={handleChangeFile}
                type="file"
                accept="audio/wav,audio/ogg,audio/mp3"
                className="hidden"
                ref={ref}
            />
            <div
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDraggableFileSatisfied('null')}
                onDrop={handleFileDrop}
                className={cn(
                    'cursor-pointer rounded-xl bg-[#f4f4f5] px-4 py-4 duration-100',
                    'hover:bg-[#e4e4e7] focus:ring-2 focus:ring-blue-500 focus:outline-none',
                    isDraggableFileSatisfied === 'sat' && 'bg-green-200',
                    isDraggableFileSatisfied === 'nsat' && 'bg-red-200',
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('file-input')?.click();
                    }
                }}
            >
                {file || isRecordSelected ? (
                    <div className="flex items-center gap-2">
                        <HiOutlineUpload size={24} className="flex-[1_0_auto]" />
                        <p className="text-[10px] italic opacity-60">
                            Вы можете выбрать новый файл
                        </p>
                    </div>
                ) : (
                    <>
                        {isDraggableFileSatisfied === 'sat' && (
                            <>
                                <p>Отлично!</p>
                                <p className="italic opacity-50">отпустите файл</p>
                            </>
                        )}
                        {isDraggableFileSatisfied === 'nsat' && (
                            <>
                                <p>Неверный формат!</p>
                                <p className="italic opacity-50">
                                    Требуется <pre className="inline">.wav/.mp3/.ogg</pre> файл
                                </p>
                            </>
                        )}
                        {isDraggableFileSatisfied === 'null' && (
                            <div className="flex items-center gap-10">
                                <HiOutlineUpload size={46} />
                                <div className="flex flex-col">
                                    <p>Выберите файл</p>
                                    <p className="italic opacity-50">или перетащите его сюда</p>
                                    <p className="italic opacity-50">
                                        или <pre className="inline">Ctrl + V</pre> для вставки из
                                        буфера обмена
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </label>
    );
});

import toWav from 'audiobuffer-to-wav';

/**
 * Склеивает массив аудио-блобов в один бесшовный WAV-файл.
 * Блобы должны быть отсортированы в правильном порядке.
 * Поддерживает MP3 на входе (декодирует через Web Audio API).
 */
export async function concatenateAudioBlobs(blobs: Blob[]): Promise<Blob> {
    if (blobs.length === 0) {
        throw new Error('Нет аудио-данных для склейки');
    }

    if (blobs.length === 1) {
        const blob = blobs[0];
        if (blob.type === 'audio/mpeg' || blob.type === 'audio/mp3') {
            return blob;
        }
        const buffer = await decodeBlobToAudioBuffer(blob);
        return audioBufferToBlob(buffer);
    }

    const audioContext = new AudioContext();
    const buffers: AudioBuffer[] = [];

    for (const blob of blobs) {
        const buffer = await decodeBlobToAudioBuffer(blob, audioContext);
        buffers.push(buffer);
    }

    const merged = mergeAudioBuffers(buffers, audioContext);
    const result = audioBufferToBlob(merged);
    await audioContext.close();

    return result;
}

async function decodeBlobToAudioBuffer(blob: Blob, context?: AudioContext): Promise<AudioBuffer> {
    const ctx = context ?? new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
}

function mergeAudioBuffers(buffers: AudioBuffer[], context: AudioContext): AudioBuffer {
    const first = buffers[0];
    const sampleRate = first.sampleRate;
    const numberOfChannels = first.numberOfChannels;

    const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
    const merged = context.createBuffer(numberOfChannels, totalLength, sampleRate);

    let offset = 0;
    for (const buffer of buffers) {
        for (let ch = 0; ch < numberOfChannels; ch++) {
            merged.getChannelData(ch).set(buffer.getChannelData(ch), offset);
        }
        offset += buffer.length;
    }

    return merged;
}

function audioBufferToBlob(buffer: AudioBuffer): Blob {
    const wav = toWav(buffer);
    return new Blob([wav], { type: 'audio/wav' });
}

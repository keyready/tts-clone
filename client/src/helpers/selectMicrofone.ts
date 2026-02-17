export async function selectMicrophone(deviceId: string) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
            },
        });

        console.log('Доступ получен к микрофону:', deviceId);

        const audioElement = document.querySelector('audio');
        if (audioElement) {
            audioElement.srcObject = stream;
            audioElement.play();
        }

        return stream;
    } catch (err) {
        const error: { name: string } = err as unknown as { name: string };
        console.error('Ошибка выбора микрофона:', error);
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            console.error('Устройство с таким ID не найдено или отключено.');
        } else if (error.name === 'NotAllowedError') {
            console.error('Доступ к микрофону запрещен пользователем.');
        }
    }
}

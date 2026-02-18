export function formatTime(milliseconds: number): string {
    const ms = Math.floor(milliseconds % 1000);
    const totalSeconds = Math.floor(milliseconds / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    const pad = (num: number, size: number = 2): string => num.toString().padStart(size, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(ms, 3)}`;
}

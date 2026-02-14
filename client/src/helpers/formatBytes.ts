export function formatBytes(
    bytes: number,
    decimals: number = 2,
    binaryUnits: boolean = true,
): string {
    if (bytes === 0) return '0 Bytes';

    const k = binaryUnits ? 1024 : 1000;
    const dm = decimals < 0 ? 0 : decimals;

    const sizes = binaryUnits
        ? ['байт', 'килобайт', 'мегабайт', 'гигабайт']
        : ['байт', 'кб', 'мб', 'гб'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

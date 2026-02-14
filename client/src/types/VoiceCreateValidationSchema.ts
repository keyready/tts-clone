import * as yup from 'yup';

/**
 * A warm, calm female voice in her late twenties with a low mezzo-soprano pitch (170–185 Hz),
 * clear articulation, and minimal pitch variation. Steady, deliberate pacing with neutral,
 * confident intonation—never rushed or overly melodic. Smooth, slightly matte timbre with
 * subtle warmth; no breathiness, hoarseness, or artificial brightness. Professional yet
 * approachable, conveying quiet authority without emotional exaggeration. Neutral accent,
 * flawless consonant precision, and seamless breath control.
 */

export const voiceDesignValidationSchema = yup
    .object({
        instruct: yup
            .string()
            .required('Введите описание желаемого голоса')
            .min(10, 'Минимум 10 символов')
            .max(600, 'Максимум 600 символов'),

        filename: yup
            .string()
            .required('Обязательно придумайте имя файла')
            .min(3, 'Минимум 3 символа')
            .max(20, 'Максимум 20 символов'),
    })
    .required();

export interface VoiceDesignSchema {
    instruct: string;
    filename: string;
}

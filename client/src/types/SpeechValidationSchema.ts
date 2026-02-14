import * as yup from 'yup';

export const speechValidationSchema = yup
    .object({
        language: yup.string().required('Выберите язык, на котором будет озвучен текст'),

        voice: yup.string().required('Выберите голос озвучки'),

        filename: yup
            .string()
            .required('Обязательно придумайте имя файла')
            .min(3, 'Минимум 3 символа')
            .max(20, 'Максимум 20 символов'),

        text: yup
            .string()
            .required('Введите текст, который нужно озвучить')
            .min(10, 'Минимум 10 символов')
            .max(2000, 'Максимум 2000 символов'),
    })
    .required();

export interface SpeechSchema {
    text: string;
    filename: string;
    voice: string;
    language: string;
}

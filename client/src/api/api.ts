import { addToast } from '@heroui/react';

import axios from 'axios';

export const $api = axios.create({
    baseURL: 'http://192.168.0.10:8006',
});

export const $whisperApi = axios.create({
    baseURL: 'http://192.168.0.10:1337',
});

$api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 409) {
                addToast({
                    title: 'Вы были заблокирпованы на сервере',
                    description: 'По причине пидорас(',
                });

                return Promise.reject(error);
            }
        } else if (error.request) {
            console.error('Нет ответа от сервера');
            return Promise.reject(error);
        } else {
            console.error('Ошибка при настройке запроса:', error.message);
            return Promise.reject(error);
        }

        return Promise.reject(error);
    },
);

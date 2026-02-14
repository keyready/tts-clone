import { HeroUIProvider, ToastProvider } from '@heroui/react';
import ReactDOM from 'react-dom/client';

import React from 'react';
import { RouterProvider } from 'react-router';

import { router } from '@/router/router';
import { StoreProvider } from '@/store/StoreProvider';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <StoreProvider>
            <HeroUIProvider>
                <ToastProvider placement="top-left" />
                <RouterProvider router={router} />
            </HeroUIProvider>
        </StoreProvider>
    </React.StrictMode>,
);

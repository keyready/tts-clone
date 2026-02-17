import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    server: {
        port: 3030,
        // https: {
        //     key: fs.readFileSync('../server.key'),
        //     cert: fs.readFileSync('../server.crt'),
        // },
    },
});

import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import fs from 'node:fs';

// https://vite.dev/config/
// @ts-ignore
export default defineConfig(({ mode }) => {
    const exampleJsonUrl = './config.example.jsonc';
    let target = '';
    if (mode == 'development') {
        const port = eval(`(${fs.readFileSync(exampleJsonUrl, "utf-8")})`).port;
        target = `http://localhost:${port}`;
    }

    return {
        plugins: [
            vue(),
            //@ts-ignore
            vueJsx(),
            //@ts-ignore
            vueDevTools(),
        ],
        server: {
            proxy: {
                '/api': {
                    target: target, // 代理到 Express 后端
                    changeOrigin: true,
                }
            }
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
        },
    };
});

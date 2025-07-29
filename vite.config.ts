import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import fs from 'node:fs';
import path from 'node:path';
import svgLoader from 'vite-svg-loader';
import autoRouterList from './plugins/auto-router-list';
import keepAlivePlus from './plugins/keep-alive-plus';
import AutoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import UnoCSS from 'unocss/vite';

// https://vite.dev/config/
// @ts-ignore
export default defineConfig(({ mode }) => {


    // @ts-ignore
    const env: NodeJS.ProcessEnv = loadEnv(mode, process.cwd(), ''); // 加载所有环境变量
    // 仅在开发使用
    const exampleJsonUrl = './config.example.jsonc';
    let target = '';
    if (mode == 'development') {
        const port = eval(`(${fs.readFileSync(exampleJsonUrl, "utf-8")})`).port;
        target = `http://localhost:${port}`;
    }


    return {
        define: {
            'process.env': env
        },
        plugins: [
            vue(),
            //@ts-ignore
            vueJsx(),
            //@ts-ignore
            vueDevTools(),
            svgLoader(),
            //打包路由
            autoRouterList({ env: env }),
            // 加强keepAlive
            keepAlivePlus(),
            UnoCSS('./unocss.config.ts'),
            // 自动导入
            AutoImport({
                imports: [
                    'vue',
                    {
                        'naive-ui': [
                            'useDialog',
                            'useMessage',
                            'useNotification',
                            'useLoadingBar'
                        ]
                    }
                ]
            }),
            Components({
                resolvers: [NaiveUiResolver()],
            })
        ],

        // 仅开发使用
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

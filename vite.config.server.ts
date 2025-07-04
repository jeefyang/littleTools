import { defineConfig, loadEnv } from 'vite';

import { VitePluginNode } from "vite-plugin-node";
import fs from "node:fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ''); // 加载所有环境变量
    // 仅在开发使用
    const exampleJsonUrl = './config.example.jsonc';
    const port = mode == "development" ? eval(`(${fs.readFileSync(exampleJsonUrl, "utf-8")})`).port : 3000;
    return {
        define: {
            'process.env': env // 将环境变量注入到全局
        },
        plugins: [
            ...VitePluginNode({
                adapter: 'express',
                appPath: './server/main.ts',
                tsCompiler: 'esbuild', // 使用 esbuild 编译 TypeScript[1](@ref)
            }),
        ],
        server: {
            port: port
        }
    };

});

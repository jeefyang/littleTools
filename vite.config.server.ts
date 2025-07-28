import { defineConfig, loadEnv } from 'vite';

import { VitePluginNode } from "vite-plugin-node";
import fs from "node:fs";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const envSrc = `./.env.${mode}`;
    if (!fs.existsSync(envSrc)) {
        console.log('环境变量文件不存在，已创建示例文件');
        fs.copyFileSync(envSrc + '.example', envSrc);
    }

    // @ts-ignore
    const env: NodeJS.ProcessEnv = loadEnv(mode, process.cwd(), ''); // 加载所有环境变量
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
            host: "0.0.0.0",
            port: port
        }
    };

});

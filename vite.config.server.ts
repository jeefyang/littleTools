import { defineConfig, loadEnv } from 'vite';

import { VitePluginNode } from "vite-plugin-node";
import fs from "node:fs";
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {


    (['./.env.local', `./.env.${mode}.local`]).forEach(k => {
        if (!fs.existsSync(k)) {
            fs.writeFileSync(k, '');
        }
    });

    // @ts-ignore
    const env: NodeJS.ProcessEnv = loadEnv(mode, process.cwd(), ''); // 加载所有环境变量
    /** 创建文件夹 */
    const dirKeys: (keyof env)[] = ['VITE_PRIVATE_RES_DIR', 'VITE_PRIVATE_RES_DIR'];
    for (let k of dirKeys) {
        if (!fs.existsSync(env[k])) {
            fs.mkdirSync(env[k]);
        }
    }

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
        },
        resolve: {
            alias: {
                "knexfile.mjs": path.resolve(__dirname, "knexfile.mjs"),
                "@project": path.resolve(__dirname),
                "@src": path.resolve(__dirname, "src"),
                "@server": path.resolve(__dirname, "server"),
                "@common": path.resolve(__dirname, "common"),
            }
        }
    };

});

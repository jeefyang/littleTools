import { defineConfig } from 'vite';

import { VitePluginNode } from "vite-plugin-node";
import fs from "node:fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const exampleJsonUrl = './config.example.jsonc';
    const port = mode == "development" ? eval(`(${fs.readFileSync(exampleJsonUrl, "utf-8")})`).port : 3000;
    console.log(port);
    return {
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

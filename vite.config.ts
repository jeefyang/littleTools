import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import fs from 'node:fs';
import path from 'node:path';

const loopDir = (dir: string, arr: string[] = []) => {
    const list = fs.readdirSync(dir);
    for (let i = 0; i < list.length; i++) {

        const f = path.join(dir, list[i]);
        if (fs.statSync(f).isFile()) {
            arr.push(path.resolve(f));
        }
        else {
            loopDir(f, arr);
        }
    }
    return arr;
};

const routerList: { [x in string]: any } = {};
const packgeRouter = (savePath: string, file?: string) => {
    console.log("打包路由开始", savePath);
    const fileList = file ? [file] : loopDir('./src/views');
    console.log('文件数量:', fileList.length);
    for (let i = 0; i < fileList.length; i++) {
        const c = fileList[i];
        if (c.split('.').reverse()[0] != "vue") {
            continue;
        }
        const str = fs.readFileSync(c, 'utf-8');
        const keyList = ['title'];
        const data: any = keyList.map((k) => {
            return str.match(new RegExp(`<!-- \\$${k}:(.*?) -->`))?.[1];
        }).reduce((a, c, i) => {
            // @ts-ignore
            a[keyList[i]] = c;
            return a;
        }, {});
        if (data.title) {
            const router = path.relative('./src/views', c).replace(/.vue$/, '').replace(/\\/g, '/');
            data.absUrl = path.resolve(c);
            data.router = router;
            console.log(data.title, c);
            routerList[router] = data;
        }
    }
    // @ts-ignore
    fs.writeFileSync(savePath, JSON.stringify(routerList));
    console.log('打包路由结束');
};

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
    let routerList: any[] = [];

    packgeRouter(`${env.VITE_PRIVATE_RES_DIR}/router.json`);
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
            {
                name: "custom-hooks",
                handleHotUpdate({ file }) {
                    if (file.split('.').reverse()[0] != "vue") {
                        return;
                    }
                    console.log('更新路由', file);
                    packgeRouter(`${env.VITE_PRIVATE_RES_DIR}/router.json`, file);
                },
                configureServer(server) {
                    console.log("vue 启动");
                    packgeRouter(`${env.VITE_PRIVATE_RES_DIR}/router.json`);
                    server.middlewares.use((req, res, next) => {
                        // 自定义中间件逻辑
                        next();
                    });
                }
            }
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

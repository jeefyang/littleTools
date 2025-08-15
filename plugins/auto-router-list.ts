
import type { Plugin, ResolvedConfig, TransformResult } from 'vite';
import fs from "node:fs";
import path from "node:path";
import { JGlobalRouterType } from "../types/export.d";


interface PluginOptions {
    prefix?: string;  // 自定义前缀，用于虚拟模块
    debug?: boolean;  // 是否启用调试日志
    env: NodeJS.ProcessEnv;
}

export default function autoRouterList(options: PluginOptions): Plugin {

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
            const keyList: JGlobalRouterType[] = ['title', 'isMulti', 'sisRenew', 'isMenu', 'isLogin'];
            const data: any = keyList.map((k) => {
                return str.match(new RegExp(`<!--\\s*\\$${k}:(.*?)\\s*-->`))?.[1];
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
    packgeRouter(`${options.env.VITE_PRIVATE_RES_DIR}/router.json`);
    return {
        name: "vite-plugin-auto-rotuer-list",
        handleHotUpdate({ file }) {
            if (file.split('.').reverse()[0] != "vue") {
                return;
            }
            console.log('更新路由', file);
            packgeRouter(`${options.env.VITE_PRIVATE_RES_DIR}/router.json`, file);
        },
        configureServer(server) {
            console.log("vue 启动");
            packgeRouter(`${options.env.VITE_PRIVATE_RES_DIR}/router.json`);
            server.middlewares.use((req, res, next) => {
                // 自定义中间件逻辑
                next();
            });
        }
    };
}
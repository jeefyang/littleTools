import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import session from "express-session";
import { userApis } from "./apis/user";
import { User } from "./dbTypes/user";
import { KnexDB } from "./knex_db";


export class Main {

    jsonUrl = './config.jsonc';
    exampleJsonUrl = './config.example.jsonc';
    app = express();
    configData: { port: number; } | null = null;
    db = new KnexDB();

    constructor() {
        if (!fs.existsSync(this.jsonUrl)) {
            if (!fs.existsSync(this.exampleJsonUrl)) {
                console.error(`例子配置文件 ${this.exampleJsonUrl} 不存在,无法启动服务`);
                process.exit(1);
            }
            fs.writeFileSync(this.jsonUrl, fs.readFileSync(this.exampleJsonUrl));
        }
        this.configData = eval(`(${fs.readFileSync(this.jsonUrl)})`);
        console.log(this.configData);
    }

    async init() {

        if (!this.configData) {
            return;
        }

        await this.db.init();
        this.setPlugin();
        this.setApi();
        this.setRes();
        await this.setVue();

        // 开发模式下,启动 vite 服务
        if (process.env.VITE_NODE_ENV == 'development') {

        }
        // 生产模式
        else {
            this.app.listen(this.configData.port);
            console.log(`监听启动:${this.configData.port}`);
        }
    }

    setPlugin() {
        this.app.use(cors());
    }

    setApi() {

        // 测试接口
        this.app.get("/api/test", (req, res) => {
            res.json({ msg: "hello world!!!", env: process.env.VITE_NODE_ENV });
        });

        // 路由列表
        this.app.get("/api/routerList", (req, res) => {
            res.json({ msg: "操作成功", data: eval(`(${fs.readFileSync(`${process.env.VITE_PRIVATE_RES_DIR}/router.json`)})`) });
        });

        // 其他接口
        userApis.bind(this)();

        // 没有接口
        this.app.get("/api/{*splat}", (req, res) => {
            res.json({ msg: "查无接口", status: 404 });
        });
    }

    /** 设置静态资源目录 */
    setRes() {
        // 静态资源目录
        this.app.get("/res/{*splat}", (req, res) => {
            const splat: string[] = (<any>req.params).splat;
            res.sendFile(path.resolve(path.join('./res', splat.join('/'))), (e) => {
                e && res.sendStatus(404);
            });
        });
    }

    async setVue() {
        // 开发模式下,直接去读取 vite 的配置文件
        if (process.env.NODE_ENV == 'development') {
            const { createServer } = await import('vite');
            const vite = await createServer({
                root: path.resolve(path.join(process.env.VITE_VUE_DIR)),
                server: { middlewareMode: true },
                configFile: path.resolve('./vite.config.ts')
            });
            this.app.use(vite.middlewares);
        }
        // 生产环境返回前端 HTML
        else {
            // 默认index.html
            this.app.get('/', (req, res) => {
                res.sendFile(path.resolve(path.join(process.env.VITE_VUE_DIR, 'index.html')));
            });
            // 其他路径
            this.app.get("/{*splat}", (req, res) => {
                const splat: string[] = (<any>req.params).splat;
                res.sendFile(path.resolve(path.join(process.env.VITE_VUE_DIR, splat.join('/'))), (e) => {
                    // 如果找不到文件,则返回 index.html
                    e && res.sendFile(path.resolve(path.join(process.env.VITE_VUE_DIR, 'index.html')));
                });
            });
        }
    }

}

const main = new Main();
main.init();

export const viteNodeApp = main.app;
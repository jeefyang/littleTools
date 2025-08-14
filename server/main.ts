import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import session from "express-session";
import { userApis } from "./apis/user";
import { KnexDB } from "./knex_db";

// 定义错误接口
interface AppError extends Error {
    statusCode?: number;
    status?: string;
}




export class Main {

    jsonUrl = './config.jsonc';
    exampleJsonUrl = './config.example.jsonc';
    app = express();
    configData: { port: number; } | null = null;
    db = new KnexDB();
    routerList: { path: string | RegExp, method: "get" | 'post'; }[] = [];

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
        this.setCapture();
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

    /**
     * 设置插件
     */
    setPlugin() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    /**
     * 捕获错误
     */
    setCapture() {
        this.app.use((err: AppError, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error(`错误: [${new Date().toISOString()}] ${err.stack}`);
            res.status(err.statusCode || 500).json({
                code: 'INTERNAL_SERVER_ERROR',
                msg: process.env.VITE_NODE_ENV === 'production'
                    ? '服务暂时不可用'
                    : err.message,
                timestamp: new Date().toISOString()
            });
        });
        // 未处理的异常和拒绝，防止进程崩溃
        process.on('uncaughtException', (error: Error) => {
            console.error('未捕获的异常:', error);
            // 可选择记录日志或执行清理操作，但不退出进程
        });

        process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
            console.error('未处理的 Promise 拒绝:', reason);
            // 可选择记录日志或执行清理操作，但不退出进程
        });


    }

    /**
     * 设置接口
     */
    setApi() {

        // 测试接口
        this.app.get("/api/test", (req, res) => {
            res.json({ code: 200, msg: "hello world!!!", data: process.env.VITE_NODE_ENV });
        });

        // 路由列表
        this.app.get("/api/routerList", (req, res) => {
            res.json({ code: 200, msg: "操作成功", data: eval(`(${fs.readFileSync(`${process.env.VITE_PRIVATE_RES_DIR}/router.json`)})`) });
        });

        // 其他接口
        userApis.bind(this)();

        // 没有接口
        this.app.get("/api/{*splat}", (req, res) => {
            res.json({ msg: "查无接口", code: 404 });
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

    /** 设置vue路由 */
    async setVue() {
        // 开发模式下,直接去读取 vite 的配置文件
        if (process.env.NODE_ENV == 'development') {
            const { createServer } = await import('vite');
            const vite = await createServer({
                root: path.resolve(path.join(process.env.VITE_VUE_DIR)),
                server: { middlewareMode: true },
                configFile: path.resolve('./vite.config.ts'),
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



    appGet(...args: Parameters<typeof this.app.get>): ReturnType<typeof this.app.get> {
        const c = args[0];
        if (Array.isArray(c)) {
            c.forEach(cc => {
                this.routerList.push({ path: cc, method: "get" });
            });
        }
        return this.app.get(...args);
    }

    appPost(...args: Parameters<typeof this.app.post>): ReturnType<typeof this.app.post> {
        const c = args[0];
        if (Array.isArray(c)) {
            c.forEach(cc => {
                this.routerList.push({ path: cc, method: "post" });
            });
        }
        return this.app.post(...args);
    }




}

const main = new Main();
main.init();

export const viteNodeApp = main.app;
import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import { userApis } from "./apis/user";
import { UtilsApis } from "./apis/utils";
import { KnexDB } from "./knex_db";
import { commonApis } from "./apis/common";
import { uploadApis } from "./apis/upload";
import { nanoid } from "nanoid";
import { scheduleJob } from "node-schedule";

// 定义错误接口
interface AppError extends Error {
    statusCode?: number;
    status?: string;
}




export class Main {

    readonly jsonUrl = './config.jsonc';
    readonly exampleJsonUrl = './config.example.jsonc';
    readonly app = express();
    configData: { port: number; } | null = null;
    readonly db = new KnexDB();
    /** 路由列表,暂无用处,计划用来观察路由数据 */
    routerList: { path: string | RegExp, method: "get" | 'post'; }[] = [];
    /** 私有资源token列表 */
    privateResToken: string[] = [];

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
        // this.app.use(express.json({ limit: '1024mb' })); // 支持 1GB 以上的 JSON 请求体
        this.app.use(express.urlencoded({ limit: '1024mb', extended: true })); // 支持 1GB 以上的表单请求体

        this.privateResToken = [...new Array(10)].map(() => nanoid(8));
        console.log(this.privateResToken);
        scheduleJob('0 3 * * *', async () => {
            this.privateResToken.push(nanoid(8));
            this.privateResToken.pop();
        });

        await this.db.init();
        this.setPlugin();
        this.setCapture();
        this.setApi();
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

        // 公共列表
        commonApis.bind(this)();

        // 上传接口
        uploadApis.bind(this)();

        // 其他接口
        userApis.bind(this)();
        UtilsApis.bind(this)();

        // 没有接口
        this.app.get("/api/{*splat}", (req, res) => {
            res.json({ msg: "查无接口", code: 404 });
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

    // @ts-ignore
    readonly appGet: typeof this.app.get = (...args: Parameters<typeof this.app.get>) => {

        try {
            const c = args[0];
            if (Array.isArray(c)) {
                c.forEach(cc => {
                    this.routerList.push({ path: cc, method: "get" });
                });
            }
            return this.app.get(...args);
        }
        catch (e) {
            console.error(e);
        }


    };



    // @ts-ignore
    readonly appPost: typeof this.app.post = (...args: Parameters<typeof this.app.post>) => {
        try {
            const c = args[0];
            if (Array.isArray(c)) {
                c.forEach(cc => {
                    this.routerList.push({ path: cc, method: "post" });
                });
            }
            return this.app.post(...args);
        }
        catch (e) {
            console.error(e);
        }
    };




}

const main = new Main();
main.init();

export const viteNodeApp = main.app;
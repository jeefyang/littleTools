import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";


const jsonUrl = './config.jsonc';
const exampleJsonUrl = './config.example.jsonc';


if (!fs.existsSync(jsonUrl)) {
    if (!fs.existsSync(exampleJsonUrl)) {
        console.error(`例子配置文件 ${exampleJsonUrl} 不存在,无法启动服务`);
        process.exit(1);
    }
    fs.writeFileSync(jsonUrl, fs.readFileSync(exampleJsonUrl));
}
const configData: { port: number; } = eval(`(${fs.readFileSync(jsonUrl)})`);
console.log(configData);

const app = express();
app.use(cors());

// 接口
app.get("/api/test", (req, res) => {
    res.json({ msg: "hello world!!!", env: process.env.VITE_NODE_ENV });
});
// 没有接口
app.get("/api/{*splat}", (req, res) => {
    res.json({ msg: "查无接口", status: 404 });
});

// 静态资源目录
app.get("/res/{*splat}", (req, res) => {
    const splat: string[] = (<any>req.params).splat;
    res.sendFile(path.resolve(path.join('./res', splat.join('/'))), (e) => {
        e && res.sendStatus(404);
    });
});
// 网页端的 Vue 目录
const vueDir = process.env.VITE_NODE_ENV == 'development' ? './' : './build_vue';
console.log(process.env.VITE_NODE_ENV, process.env.VITE_TOKEN);
(async () => {
    // 开发模式下,直接去读取 vite 的配置文件
    if (process.env.NODE_ENV == 'development') {
        const { createServer } = await import('vite');
        const vite = await createServer({
            root: path.resolve(path.join(vueDir)),
            server: { middlewareMode: true },
            configFile: path.resolve('./vite.config.ts')
        });
        app.use(vite.middlewares);
    }
    // 生产环境返回前端 HTML
    else {
        // 默认index.html
        app.get('/', (req, res) => {
            res.sendFile(path.resolve(path.join(vueDir, 'index.html')));
        });
        // 其他路径
        app.get("/{*splat}", (req, res) => {
            const splat: string[] = (<any>req.params).splat;
            res.sendFile(path.resolve(path.join(vueDir, splat.join('/'))), (e) => {
                // 如果找不到文件,则返回 index.html
                e && res.sendFile(path.resolve(path.join(vueDir, 'index.html')));
            });
        });
        app.listen(configData.port);
        console.log(`监听启动:${configData.port}`);


    }
})();



export const viteNodeApp = app;
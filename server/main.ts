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

app.get("/api/test", (req, res) => {
    res.json({ msg: "hello world", envir: process.env.NODE_ENV });
});

const vueDir = process.env.NODE_ENV == 'development' ? './' : './build_vue';

(async () => {
    if (process.env.NODE_ENV == 'development') {
        const { createServer } = await import('vite');
        const vite = await createServer({
            root: path.resolve(path.join(vueDir)),
            server: { middlewareMode: true },
            configFile: path.resolve('./vite.config.ts')
        });
        app.use(vite.middlewares);
    }
    else {
        // 生产环境返回前端 HTML
        app.get('/', (req, res) => {
            res.sendFile(path.resolve(path.join(vueDir, 'index.html')));
        });
        app.get("/{*splat}", (req, res) => {
            //@ts-ignore
            res.sendFile(path.resolve(path.join(vueDir, req.params.splat.join('/'))), (e) => {
                res.send("路径不存在");
            });
        });
        app.listen(configData.port);
        console.log(`监听启动:${configData.port}`);


    }
})();



export const viteNodeApp = app;
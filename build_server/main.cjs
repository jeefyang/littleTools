"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
));
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const jsonUrl = "./config.jsonc";
const exampleJsonUrl = "./config.example.jsonc";
if (!fs.existsSync(jsonUrl)) {
    if (!fs.existsSync(exampleJsonUrl)) {
        console.error(`例子配置文件 ${exampleJsonUrl} 不存在,无法启动服务`);
        process.exit(1);
    }
    fs.writeFileSync(jsonUrl, fs.readFileSync(exampleJsonUrl));
}
const configData = eval(`(${fs.readFileSync(jsonUrl)})`);
console.log(configData);
const app = express();
app.use(cors());
app.get("/api/test", (req, res) => {
    res.json({ msg: "hello world", envir: process.env.NODE_ENV });
});
const vueDir = process.env.NODE_ENV == "development" ? "./" : "./build_vue";
(async () => {
    if (process.env.NODE_ENV == "development") {
        const { createServer } = await import("vite");
        const vite = await createServer({
            root: path.resolve(path.join(vueDir)),
            server: { middlewareMode: true }
        });
        app.use(vite.middlewares);
    } else {
        app.get("/", (req, res) => {
            res.sendFile(path.resolve(path.join(vueDir, "index.html")));
        });
        app.get("/{*splat}", (req, res) => {
            console.log(req.params.splat)
            res.sendFile(path.resolve(path.join(vueDir, req.params.splat.join("/"))), (e) => {
                res.send("404")
            });



        });
        app.listen(configData.port);
        console.log(`监听启动:${configData.port}`);
    }
})();
const viteNodeApp = app;
exports.viteNodeApp = viteNodeApp;

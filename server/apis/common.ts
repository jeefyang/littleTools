import { CommonApiUrls } from "@common/apis/common";
import { Main } from "../main";
import { Base } from "./class/base";
import fs from 'fs';
import { cryptoUtil } from "@server/utils/cryptoUtil";
import path from "path";
import { commonUtils } from "@common/utils/common";

export function commonApis(this: Main) {
    const base = new Base("", CommonApiUrls);

    // 路由列表
    const decode_routerList = base.decode.routerList;
    this.appGet(decode_routerList.url, async (req, res) => {
        const j: { [x: string]: JRouterType; } = eval(`(${fs.readFileSync(`${process.env.VITE_PRIVATE_RES_DIR}/router.json`)})`);
        const { token } = req.headers as JHeaderType;
        if (!token || !cryptoUtil.verifyToken(token)) {
            for (let key in j) {
                if (j[key].isLogin != "1") {
                    continue;
                }
                delete j[key];
            }
        }
        res.json(decode_routerList.getResult({ data: j }));
    });

    // 公共资源列表
    // 静态资源目录
    this.appGet(process.env.VITE_API_BASE_URL + commonUtils.resBaseUrl + "/{*splat}", (req, res) => {
        const splat: string = (<any>req.params).splat;
        res.sendFile(path.resolve(path.join(process.env.VITE_RES_DIR, splat)), (e) => {
            e && res.sendStatus(base.statusMap.noData);
        });
    });

    // 私有资源列表
    this.appGet(process.env.VITE_API_BASE_URL + commonUtils.privateResBaseUrl + "/:token/:type/{*splat}", (req, res) => {
        if (!this.privateResToken.includes(req.params.token)) {
            res.sendStatus(base.statusMap.noAuth);
            return;
        }
        /** 白名单列表,手动公开资源会比较安全 */
        const whiteList = ['markdowns'];
        // 筛选可公开的资源
        if (!whiteList.includes(req.params.type)) {
            res.sendStatus(base.statusMap.noData);
            return;
        }
        const splat: string[] = (<any>req.params).splat;
        res.sendFile(path.resolve(path.join(process.env.VITE_PRIVATE_RES_DIR, req.params.type, ...splat)), (e) => {
            e && res.sendStatus(base.statusMap.noData);
        });
    });

}
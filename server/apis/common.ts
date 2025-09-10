import { CommonApiUrls } from "@common/apis/CommonApis";
import { Main } from "../main";
import { Base } from "./class/base";
import fs from 'fs';
import { cryptoUtil } from "@server/utils/cryptoUtil";

export function commonApis(this: Main) {
    const base = new Base("", CommonApiUrls);

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
}
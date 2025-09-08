import { Main } from "../main";
import { cryptoUtil } from "../utils/cryptoUtil";
import { Base } from "./class/base";
import { nanoid } from "nanoid";

export function UtilsApis(this: Main) {
    const base = new Base('utils');
    this.appGet(base.getUrl('/nanoid'), async (req, res) => {
        const j: JResposeType<UtilsApiNanoid> = {
            code: 200,
            msg: "操作成功",
            data: {
                id: nanoid(48)

            }
        };
        return res.status(200).json(j);
    });
}
import { Main } from "../main";
import { Base } from "./class/base";
import { OPApiUrls, opMapKeyDefaultStr, whiteList_opMapKey } from "@common/apis/op";


export function OPApis(this: Main) {
    const base = new Base("op", OPApiUrls);

    const decode_pageList = base.decode.pageList;
    this.appPost(decode_pageList.url, async (req, res) => {
        const j = decode_pageList.getResult({});
        return res.status(base.statusMap.success).json(j);
    });

    const decode_getMapKey = base.decode.getMapKey;
    this.appGet(decode_getMapKey.url, async (req, res) => {

        // 验证有没有登录
        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "没有权限");

        }
        const { key, type } = decode_getMapKey.getQuery(req);

        const index = whiteList_opMapKey.findIndex(c => {
            return c.key == key && type == (c.type || 'string');
        });
        // 匹配错误
        if (index == -1) {
            return base.returnStatus("error", res, "匹配错误");
        }

        const u = await this.db.whereList('opMapKey', { key, type });
        let line = u[0];
        // 没有数据需要写入默认值
        if (!line) {
            line = {
                key,
                type,
                tsType: whiteList_opMapKey[index]?.tsType || "",
                value: opMapKeyDefaultStr[type],
                desc: whiteList_opMapKey[index]?.desc || "",
            };
            await this.db.table('opMapKey').insert({ ...line });
        }

        return res.status(base.statusMap.success).json({
            data: line
        });
    });

    const decode_setMapKey = base.decode.setMapKey;
    this.appPost(decode_setMapKey.url, async (req, res) => {
        // 验证有没有登录
        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "没有权限");
        }

        const { key, type, data, isClear, isAdd, isOverride } = decode_setMapKey.getBody(req);

        const index = whiteList_opMapKey.findIndex(c => {
            return c.key == key && type == (c.type || 'string');
        });
        // 匹配错误
        if (index == -1) {
            return base.returnStatus("error", res, "匹配错误");
        }

        // 清空数据
        if (isClear) {
            await this.db.where('opMapKey', { type, key }).update({ value: opMapKeyDefaultStr[type] });
            return res.status(base.statusMap.success).json({
                msg: '清空成功'
            });
        }

        // 数据不能为空
        if (data == null) {
            return base.returnStatus("error", res, "数据不能为空");
        }
        // 匹配数据
        if (
            (type == 'boolean' && typeof data == 'boolean') ||
            (type == "array" && !Array.isArray(data)) ||
            (type == "object" && typeof data != "object") ||
            (type == "number" && typeof data != "number") ||
            (type == "string" && typeof data != "string")
        ) {
            return base.returnStatus("error", res, "数据类型错误");
        }
        const addTypeList: (keyof OPApiMapKeyValueType)[] = ['array', 'number', 'string', 'object'];
        // 追加模式
        if (isAdd && addTypeList.includes(type)) {
            const list = await this.db.whereList('opMapKey', { type, key });
            let line = list[0];
            if (line == null) {
                line = {
                    key,
                    type,
                    tsType: whiteList_opMapKey[index]?.tsType || "",
                    value: opMapKeyDefaultStr[type],
                    desc: whiteList_opMapKey[index]?.desc || "",
                };
            }
            if (type == "string" || type == 'number') {
                line.value += data;
            }
            else if (type == 'array') {
                let curArr: any[] = JSON.parse(line.value);
                curArr = curArr.filter(c => !(data as any[]).includes(c));
                curArr.push(...data);
            }
            else if (type == 'object') {
                let curObj: any = JSON.parse(line.value);
                const curKeys = Object.keys(curObj);
                Object.keys(data).forEach(k => {
                    if (curKeys.includes(k) && !isOverride) {
                        return;
                    }
                    curObj[k] = data[k];
                });
            }
            await this.db.table('opMapKey').insert({ ...line });
        }


        const dataStr = type == "string" ? data : JSON.stringify(data);
        await this.db.where('opMapKey', { type, key }).update({ value: dataStr });
        return res.status(base.statusMap.success).json({
            msg: '设置成功'
        });
    });


}
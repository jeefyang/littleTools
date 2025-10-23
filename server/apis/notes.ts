import path from "path";
import fs from "fs";
import { Main } from "../main";
import { Base } from "./class/base";
import { NotesApiUrls } from "@common/apis/notes";
import { Markdowns } from "@server/dbTypes/note";


export function NotesApis(this: Main) {
    const base = new Base("op", NotesApiUrls);

    // 创建markdown
    const decode_markdownCreate = base.decode.markdownCreate;
    this.appPost(decode_markdownCreate.url, async (req, res) => {

        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "请先登录");
        }

        const body = decode_markdownCreate.getBody(req);

        if (!body.uuid) {
            return base.returnStatus("noData", res, "数据错误");
        }
        const lines = await this.db.whereList('markdowns', { uuid: body.uuid });
        if (lines.length > 0) {
            return base.returnStatus("error", res, "数据已存在");
        }
        body.name = body.name?.trim() || "";
        !body.createDate && (body.createDate = (new Date()).getTime());
        !body.fixDate && (body.fixDate = (new Date()).getTime());
        !body.desc && (body.desc = "");
        !body.tags && (body.tags = []);

        const dir = path.join(process.env.VITE_PRIVATE_RES_DIR, 'markdowns', body.uuid);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (body.content) {
            fs.writeFileSync(path.join(dir, 'index.md'), body.content, 'utf-8');
        }

        const line: Markdowns = {
            uuid: body.uuid,
            name: body.name,
            desc: body.desc,
            tags: JSON.stringify(body.tags),
            fixDate: body.fixDate,
            createDate: body.createDate
        };

        fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(line), 'utf-8');

        await this.db.table("markdowns").insert(line);

        return base.returnStatus("success", res, "创建成功");
    });

    // 修改markdown
    const decode_markdownEdit = base.decode.markdownEdit;
    this.appPost(decode_markdownEdit.url, async (req, res) => {

        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "请先登录");
        }

        const body = decode_markdownCreate.getBody(req);
        if (!body.uuid) {
            return base.returnStatus("noData", res, "数据错误");
        }
        const lines = await this.db.whereList('markdowns', { uuid: body.uuid });
        if (lines.length == 0) {
            return base.returnStatus("error", res, "数据未存在");
        }
        const dir = path.join(process.env.VITE_PRIVATE_RES_DIR, 'markdowns', body.uuid);
        if (!fs.existsSync(dir)) {
            return base.returnStatus("error", res, "数据未存在");
        }
        if (body.content) {
            fs.writeFileSync(path.join(dir, 'index.md'), body.content, 'utf-8');
        }
        const line: Partial<Markdowns> = {
            fixDate: new Date().getTime(),
        };
        if (body.name) {
            line.name = body.name;
        }
        if (body.desc) {
            line.desc = body.desc;
        }
        if (body.fixDate) {
            line.fixDate = body.fixDate;
        }
        if (body.tags) {
            line.tags = JSON.stringify(body.tags);
        }
        await this.db.whereUpdate("markdowns", { uuid: body.uuid }, line);
        return base.returnStatus("success", res, "修改成功");
    });

    // 获取markdown列表
    const decode_markdownList = base.decode.markdownList;
    this.appPost(decode_markdownList.url, async (req, res) => {

        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "请先登录");
        }

        const body = decode_markdownList.getBody(req);
        const lines = await this.db.whereList('markdowns', {});
        const resData = decode_markdownList.getResult({ data: { list: [] } });
        if (lines.length == 0) {
            return res.status(base.statusMap.success).json(resData);
        }
        resData.data.list = lines.filter(c => {
            if (body.name && !c.name.includes(body.name)) {
                return false;
            }
            if (body.tags) {
                const tags: string[] = JSON.parse(c.tags || "[]");
                if (tags.findIndex(c => body.tags!.includes(c)) == -1) {
                    return false;
                }
            }
            if (body.fixEnd && body.fixStart) {
                if (c.fixDate > body.fixEnd || c.fixDate < body.fixStart) {
                    return false;
                }
            }
            if (body.createEnd && body.createStart) {
                if (c.createDate > body.createEnd || c.createDate < body.createStart) {
                    return false;
                }
            }
            return true;
        }).map(c => ({
            createDate: c.createDate,
            fixDate: c.fixDate,
            tags: JSON.parse(c.tags || "[]"),
            name: c.name,
            uuid: c.uuid,
            desc: c.desc || ""
        }));
        return res.status(base.statusMap.success).json(resData);
    });

    // 删除markdown
    const decode_markdownDelete = base.decode.markdownDelete;
    this.appPost(decode_markdownDelete.url, async (req, res) => {

        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "请先登录");
        }

        const body = decode_markdownDelete.getBody(req);
        if (!body.uuid) {
            return base.returnStatus("noData", res, "数据错误");
        }
        const len = await this.db.where("markdowns", { uuid: body.uuid }).delete();
        if (len == 0) {
            return base.returnStatus("error", res, "数据未找到");
        }
        return base.returnStatus("success", res, "删除成功");
    });


    // 获取markdownTag列表
    const decode_markdownTagList = base.decode.markdownTagList;
    this.appGet(decode_markdownTagList.url, async (req, res) => {

        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "请先登录");
        }

        const lines = await this.db.whereList("markdowns", {});
        const tagObject: { [x: string]: number; } = {};
        lines.forEach(c => {
            const tags: string[] = JSON.parse(c.tags || "[]");
            tags.forEach(c => {
                tagObject[c] = (tagObject[c] || 0) + 1;
            });
        });
        const list = Object.keys(tagObject).map(k => k);
        return res.status(base.statusMap.success).json(decode_markdownTagList.getResult({
            data: { list }
        }));
    });

    /** 是否为新建markdown */
    const decode_markdownIsNew = base.decode.markdownIsNew;
    this.appPost(decode_markdownIsNew.url, async (req, res) => {

        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "请先登录");
        }

        const body = decode_markdownIsNew.getBody(req);
        if (!body.uuid) {
            return base.returnStatus("noData", res, "数据错误");
        }

        const lines = await this.db.where("markdowns", { uuid: body.uuid });
        return res.status(base.statusMap.success).json(decode_markdownIsNew.getResult({
            data: { isNew: lines.length == 0 }
        }));
    });


}
import { Main } from "@server/main";
import fs, { rename } from 'fs';
import path from 'path';
import { nanoid } from "nanoid";
import { commonUtils } from "@common/utils/common";
import { Base } from "./class/base";
import crypto from "crypto";
import { formidable, type File } from "formidable";
import { Response } from "express";


type TempFileType = {
    originName: string,
    originExt: string;
    originFilename: string;
    tempName: string;
};


export function uploadApis(this: Main) {

    const base = new Base("", {});


    const fileType: { name: string, list: string[]; }[] = [
        { name: "images", list: ["jpg", 'jpeg', 'png', 'apng', 'webp', 'gif', 'bmp'] },
        { name: "videos", list: ['mp4', 'webm', 'mkv', 'avi'] },
        { name: "musics", list: ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'] }
    ];

    const getQuery = (req: any) => {
        const query = req.query as UploadFileDataType;
        // 解码一下
        query.dir && (query.dir = decodeURIComponent(query.dir!));
        !query.renameType && (query.renameType = "time-uuid6");
        !query.binaryType && (query.binaryType = 32);
        return query;
    };

    const getHash = (query: UploadFileDataType, p: string) => {
        const b = fs.readFileSync('p');
        const type = query.renameType!.includes("md5") ? 'md5' : query.renameType!.includes("sha256") ? 'sha256' : "";
        if (!type) return "";
        let hash = crypto.createHash(type).update(b).digest('hex');
        query.binaryType == 32 && (hash = BigInt('0x' + hash).toString(32));
        return hash;
    };

    const getFileName = (query: UploadFileDataType, temp: TempFileType) => {
        if (query.renameType == 'originName') {
            return temp.originFilename;
        }
        else if (query.renameType == 'forceName' && query.forceName) {
            return query.forceName;
        }
        else if (query.renameType == 'md5-name') {
            const hex = getHash(query, path.join(process.env.VITE_TEMP_DIR, temp.tempName));
            return hex + '-' + temp.originFilename;
        }
        else if (query.renameType == "md5") {
            const hex = getHash(query, path.join(process.env.VITE_TEMP_DIR, temp.tempName));
            return hex + temp.originExt;
        }
        else if (query.renameType == 'sha256-name') {
            const hex = getHash(query, path.join(process.env.VITE_TEMP_DIR, temp.tempName));
            return hex + '-' + temp.originFilename;
        }
        else if (query.renameType == "sha256") {
            const hex = getHash(query, path.join(process.env.VITE_TEMP_DIR, temp.tempName));
            return hex + temp.originExt;
        }
        else if (query.renameType == "uuid16") {
            return nanoid(16) + temp.originExt;
        }
        else if (query.renameType == 'time-uuid6') {
            return new Date().getTime() + '-' + nanoid(6) + temp.originExt;
        }
        else if (query.renameType == 'uuid6-name') {
            return nanoid(6) + '-' + temp.originFilename;
        }

        return temp.originFilename;
    };
    const getDirPath = (query: UploadFileDataType, temp: TempFileType) => {
        let p = "";
        // 普通资源类型
        if (query.type) {
            // 白名单写入
            const whiteList: UploadFileType[] = ['xx'];
            if (whiteList.includes(query.type)) {
                p = path.join(process.env.VITE_PRIVATE_RES_DIR, query.type, query.dir || "");
            }

        }
        // 私有资源类型
        else if (query.privateType) {
            // 特殊目录
            if (query.privateType == 'markdown') {
                const folderName = fileType.find(c => c.list.includes(temp.originExt.split('.').reverse()[0]))?.name || "others";
                p = path.join(process.env.VITE_PRIVATE_RES_DIR, 'markdowns', query.dir || "", folderName);
            }
            // 白名单写入
            else {
                const whiteList: UploadFilePrivateType[] = [];
                if (whiteList.includes(query.privateType)) {
                    p = path.join(process.env.VITE_PRIVATE_RES_DIR, query.privateType, query.dir || "");
                }
            }

        }
        return p;
    };

    const processFile = (temp_file: TempFileType, query: UploadFileDataType,) => {
        const res: JResposeType = {
            code: base.statusMap.success,
            msg: ""
        };
        const temp_fileUrl = path.join(process.env.VITE_TEMP_DIR, temp_file.tempName);
        if (!fs.existsSync(temp_fileUrl)) {
            res.code = base.statusMap.noData;
            res.msg = "上传失败,没有保存成功";
            return res;
        }

        const dirPath = getDirPath(query, temp_file);

        const filename = getFileName(query, temp_file);

        // 过滤目录,目录为则表示上传位置不合规
        if (!dirPath) {
            res.code = base.statusMap.noData;
            res.msg = "上传失败,请检查上传目录是否正确";
            return res;
        }
        const url = path.join(dirPath, filename);
        const displayUrl = query.privateType ? path.relative(process.env.VITE_PRIVATE_RES_DIR, url) : query.type ? path.relative(process.env.VITE_RES_DIR, url) : url;

        // 没有目录需要创建目录
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        // 存在同名文件且不覆盖
        if (fs.existsSync(url)) {
            // 不覆盖
            if (!query.override) {

                return {
                    msg: "上传成功,文件已经存在", code: 200, data: {
                        url,
                        displayUrl,
                        filename
                    }
                } as UploadFileReturnType;
            }
            // 覆盖
            else {
                fs.unlinkSync(url);
            }
        }
        fs.renameSync(temp_fileUrl, url);
        return {
            msg: "上传成功", code: 200, data: {
                url,
                displayUrl,
                filename
            }
        } as UploadFileReturnType;

    };

    this.appPost(process.env.VITE_API_BASE_URL + commonUtils.uploadBaseUrl, (req, res, next) => {


        const query = getQuery(req);
        // 是由目录需要验证登录
        if (query.privateType && !base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "请先登录");
        }
        let temp_file_list: TempFileType[] = [];


        const form = formidable({
            maxFileSize: 1024 * 1024 * 1024,
            uploadDir: process.env.VITE_TEMP_DIR,
            keepExtensions: true,
            filename: (name, ext, part, from) => {
                const id = nanoid(32);
                temp_file_list.push({
                    originName: name,
                    originExt: ext,
                    originFilename: name + '.' + ext,
                    tempName: id
                });
                return id;
            }
        });


        form.parse(req, (err, fields, files) => {
            if (err) {
                next(err);
                return;
            }
            const r = processFile(temp_file_list[0], query);
            return res.status(r.code).json(r);
        });
    });
};
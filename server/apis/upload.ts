import { Main } from "@server/main";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { nanoid } from "nanoid";
import { commonUtils } from "@common/utils/common";
import { Base } from "./class/base";




export function uploadApis(this: Main) {

    const base = new Base("", {});


    const fileType: { name: string, list: string[]; }[] = [
        { name: "images", list: ["jpg", 'jpeg', 'png', 'apng', 'webp', 'gif', 'bmp'] },
        { name: "videos", list: ['mp4', 'webm', 'mkv', 'avi'] },
        { name: "musics", list: ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'] }
    ];
    const getDirPath = (o: UploadFileDataType) => {
        let p = "";
        // 普通资源类型
        if (o.type) {
            // 白名单写入
            const whiteList: uploadFileType[] = ['xx'];
            if (whiteList.includes(o.type)) {
                p = path.join(process.env.VITE_PRIVATE_RES_DIR, o.type, o.dir || "");
            }

        }
        // 私有资源类型
        else if (o.privateType) {
            if (o.privateType == 'markdown') {
                const extname = path.extname(o.filename!).slice(1);
                const folderName = fileType.find(c => c.list.includes(extname))?.name || "others";
                p = path.join(process.env.VITE_PRIVATE_RES_DIR, 'markdowns', o.dir || "", folderName);
            }
            // 白名单写入
            else {
                const whiteList: uploadFilePrivateType[] = [];
                if (whiteList.includes(o.privateType)) {
                    p = path.join(process.env.VITE_PRIVATE_RES_DIR, o.privateType, o.dir || "");
                }
            }

        }
        return p;

    };
    const uploadMulter = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const query = req.query as UploadFileDataType;
                if (query.privateType) {
                    // 验证有没有登录
                    if (!base.verifyToken(req)) {
                        return base.returnStatus("noAuth", req.res, "登录信息错误");
                    }
                }
                // 解码一下
                query.dir = decodeURIComponent(query.dir);
                const p = getDirPath({ ...query, filename: file.originalname });
                if (!p) {
                    return base.returnStatus("noData", req.res, `类型 ${query.privateType || query.type} 错误`);
                }
                if (!fs.existsSync(p)) {
                    fs.mkdirSync(p, { recursive: true });
                }
                cb(null, p);
            },
            filename(_req, file, cb) {
                const timestamp = Date.now();
                const ext = path.extname(file.originalname);
                cb(null, `${timestamp}_${nanoid(6)}${ext}`);
            }
        }),
        limits: {
            fileSize: 1024 * 1024 * 1024 //限制1g
        }
    });
    this.appPost(process.env.VITE_API_BASE_URL + commonUtils.uploadBaseUrl, uploadMulter.single('file'), (req, res) => {

        if (!req.file) {
            return res.json({ msg: "上传失败", code: base.statusMap.noData } as JResposeType);
        }
        const query = req.query as UploadFileDataType;
        // 解码一下
        query.dir = decodeURIComponent(query.dir);
        const p = getDirPath({ ...query, filename: req.file.originalname });
        const url = path.join(p, req.file.filename);
        const displayUrl = query.privateType ? path.relative(process.env.VITE_PRIVATE_RES_DIR, url) : query.type ? path.relative(process.env.VITE_RES_DIR, url) : url;
        res.json({
            msg: "上传成功", code: 200, data: {
                url,
                displayUrl,
                filename: req.file.filename
            }
        } as UploadFileReturnType);
    });
};
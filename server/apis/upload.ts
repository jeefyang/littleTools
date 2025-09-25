import { Main } from "@server/main";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { nanoid } from "nanoid";

type uploadFileType = 'markdown';


export function uploadApis(this: Main) {
    const fileType: { name: string, list: string[]; }[] = [
        { name: "images", list: ["jpg", 'jpeg', 'png', 'apng', 'webp', 'gif', 'bmp'] },
        { name: "videos", list: ['mp4', 'webm', 'mkv', 'avi'] },
        { name: "musics", list: ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'] }
    ];
    const getDirPath = (o: {
        type: uploadFileType;
        uuid?: string,
        filename: string;
    }) => {
        console.log('getDirPath', o);
        let p = "";
        if (o.type == 'markdown') {
            const extname = path.extname(o.filename).slice(1);
            const folderName = fileType.find(c => c.list.includes(extname))?.name || "others";
            p = path.join(process.env.VITE_PRIVATE_RES_DIR, 'markdowns', o.uuid || "", folderName);
        }
        return p;

    };
    const uploadMulter = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const { type, uuid } = req.query as { type: uploadFileType, uuid?: string; };
                const p = getDirPath({ type, uuid, filename: file.originalname });
                if (!p) {
                    return cb(new Error(`${type} 上传类型错误`), p);
                }
                if (!fs.existsSync(p)) {
                    fs.mkdirSync(p, { recursive: true });
                }
                cb(null, p);
            },
            filename(req, file, cb) {
                const timestamp = Date.now();
                const ext = path.extname(file.originalname);
                cb(null, `${timestamp}_${nanoid(6)}${ext}`);
            }
        }),
        limits: {
            fileSize: 1024 * 1024 * 1024 //限制1g
        }
    });
    this.appPost(process.env.VITE_API_BASE_URL + 'upload', uploadMulter.single('file'), (req, res) => {
        console.log(req.file);
        if (!req.file) {
            return res.json({ msg: "上传失败", code: 404 } as JResposeType);
        }
        const { type, uuid } = req.query as { type: uploadFileType, uuid?: string; };
        const p = getDirPath({ type, uuid, filename: req.file.originalname });
        const absUrl = path.join(p, req.file.filename);
        res.json({
            msg: "上传成功", code: 200, data: {
                url: path.relative(process.env.VITE_PRIVATE_RES_DIR, absUrl),
                absUrl,
                displayUrl: path.relative(path.join(process.env.VITE_PRIVATE_RES_DIR, type + 's', uuid || ""), absUrl)
            }
        } as JResposeType);
    });
};
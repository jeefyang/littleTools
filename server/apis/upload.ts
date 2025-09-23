import { Main } from "@server/main";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
export function uploadApis(this: Main) {
    const fileType = {
        images: ["jpg", 'jpeg', 'png', 'apng', 'webp', 'gif', 'bmp'],
        videos: ['mp4', 'webm', 'mkv'],
        musics: ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac']
    };

    const uploadMulter = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {

                const { type, uuid } = req.query as { type: "markdown", uuid?: string; };
                if (type == 'markdown') {
                    const p = path.join(process.env.VITE_PRIVATE_RES_DIR, 'markdowns', uuid || "");
                    // path.extname()

                }
            }
        })
    });
    this.app.post(process.env.VITE_API_BASE_URL + 'upload', upload.);
}
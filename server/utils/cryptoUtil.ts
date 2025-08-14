import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fs from 'fs';
import path from "path";



class CryptoUtil {
    /** 密码盐数量 */
    readonly saltCount: number = 10;
    /** 密码盐 */
    salt = bcrypt.genSaltSync(this.saltCount);
    /** jwt密钥 */
    jwtSecret: string = "";
    /** jwt密钥文件路径 */
    jwtFilePath: string = path.resolve(process.env.VITE_PRIVATE_RES_DIR, "jwt.key");
    constructor() {
        this.loadJwtSecret();
    }

    /** 加载jwt密钥 */
    loadJwtSecret() {
        if (!fs.existsSync(this.jwtFilePath)) {
            this.updateJwtSecret();
        }
        this.jwtSecret = fs.readFileSync(this.jwtFilePath, 'utf-8');
    }

    /** 更新jwt密钥 */
    updateJwtSecret() {
        const secret = crypto.randomBytes(32).toString('hex');
        fs.writeFileSync(this.jwtFilePath, secret);
    }

    /** 密码加密 */
    hasedPassword(pw: string) {
        return bcrypt.hashSync(pw, this.salt);
    }

    /** 密码对照 */
    comparePassword(pw: string, hasedPw: string) {
        return bcrypt.compareSync(pw, hasedPw);
    }

    /** 生成jwt函数 */
    generateToken(data: any, time: jwt.SignOptions['expiresIn'] = "30d") {
        return jwt.sign(data, this.jwtSecret, { expiresIn: time });
    }

    /** 验证jwt 函数 */
    verifyToken(token: string) {
        try {
            const decode = jwt.verify(token, this.jwtSecret);
            return decode;
        }
        catch (e) {
            return null; //无效token;
        }
    }
}

export const cryptoUtil = new CryptoUtil();
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
    /** jwt公共密钥 */
    commonSecretKey = "";
    /** jwt公共密钥文件路径 */
    commonKeyFilePath: string = path.resolve(process.env.VITE_PRIVATE_RES_DIR, "jwt.key");
    constructor() {
        this.loadCommonSecretKey();
    }

    /** 加载jwt公共密钥 */
    loadCommonSecretKey() {
        if (!fs.existsSync(this.commonKeyFilePath)) {
            this.updateCommonSecretKey();
        }
        this.commonSecretKey = fs.readFileSync(this.commonKeyFilePath, 'utf-8');
    }

    /** 更新jwt公共密钥 */
    updateCommonSecretKey() {
        const secret = crypto.randomBytes(32).toString('hex');
        fs.writeFileSync(this.commonKeyFilePath, secret);
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
    generateToken(data: any, other?: {
        time?: jwt.SignOptions['expiresIn'];
        key?: string;
    }) {
        if (!other) {
            other = {};
        }
        if (!other.time) {
            other.time = "30d";
        }
        if (!other.key) {
            other.key = this.commonSecretKey;
        }
        return jwt.sign(data, other.key, { expiresIn: other.time });
    }

    /** 验证jwt 函数
     * @returns null为无效token
     */
    verifyToken(token: string, other?: {
        key?: string;
    }) {
        if (!other) {
            other = {};
        }
        if (!other.key) {
            other.key = this.commonSecretKey;
        }
        try {
            const decode = jwt.verify(token, other.key);
            return decode;
        }
        catch (e) {
            return null; //无效token;
        }
    }
}

export const cryptoUtil = new CryptoUtil();
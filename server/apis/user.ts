import { Main } from "../main";
import { cryptoUtil } from "../utils/cryptoUtil";
import { Base } from "./class/base";
import { UserApiUrls } from "@common/apis/user";

export function userApis(this: Main) {
    const base = new Base('user', UserApiUrls);

    const decode_login = base.decode.login;
    // 登录
    this.appPost(decode_login.url, async (req, res) => {
        const { username, password } = decode_login.getBody(req);
        const u = await this.db.where("users", { username });
        if (!u || u.length == 0) {
            return res.status(base.statusMap.noAuth).json({
                code: base.statusMap.noAuth,
                msg: "用户不存在"
            });
        }
        const user = u[0];
        const isValid = cryptoUtil.comparePassword(password, user.password);
        if (!isValid) {
            return res.status(base.statusMap.noAuth).json({
                code: base.statusMap.noAuth,
                msg: "密码错误"
            });
        }
        const token = cryptoUtil.generateToken({ id: user.id, username: user.username });
        const j = decode_login.getResult({
            msg: "登录成功",
            data: {
                token,
                username: user.username,
                email: user.email

            }
        });
        return res.status(base.statusMap.success).json(j);
    });

    const decode_getPrivateResToken = base.decode.getPrivateResToken;
    // 获取私有资源token
    this.appPost(decode_getPrivateResToken.url, async (req, res) => {
        if (!base.verifyToken(req)) {
            return res.status(base.statusMap.noAuth);
        }
        return res.status(base.statusMap.success).json(decode_getPrivateResToken.getResult({
            msg: "获取成功",
            data: {
                token: this.privateResToken[0]
            }
        }));
    });

}
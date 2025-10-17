import { Main } from "../main";
import { cryptoUtil } from "../utils/cryptoUtil";
import { Base } from "./class/base";
import { UserApiUrls } from "@common/apis/user";

export function userApis(this: Main) {
    const base = new Base('user', UserApiUrls);

    // 登录
    const decode_login = base.decode.login;
    this.appPost(decode_login.url, async (req, res) => {
        const { username, password } = decode_login.getBody(req);
        const u = await this.db.where("users", { username });
        if (!u || u.length == 0) {
            return base.returnStatus("noAuth", res, "用户错误");

        }
        const user = u[0];
        const isValid = cryptoUtil.comparePassword(password, user.password);
        if (!isValid) {
            return base.returnStatus("noAuth", res, "密码错误");

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

    // 获取私有资源token
    const decode_getPrivateResToken = base.decode.getPrivateResToken;
    this.appGet(decode_getPrivateResToken.url, async (req, res) => {
        // 验证有没有登录
        if (!base.verifyToken(req)) {
            return base.returnStatus("noAuth", res, "登录信息错误");

        }
        return res.status(base.statusMap.success).json(decode_getPrivateResToken.getResult({
            msg: "获取成功",
            data: {
                token: this.privateResToken[0]
            }
        }));
    });

}
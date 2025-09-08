import { Main } from "../main";
import { cryptoUtil } from "../utils/cryptoUtil";
import { Base } from "./class/base";

export function userApis(this: Main) {
    const base = new Base('user');

    this.appPost(base.getUrl('/login'), async (req, res) => {
        const { username, password } = req.body as UserApiLogin['from'];
        const u = await this.db.where("users", { username });
        if (!u || u.length == 0) {
            return res.status(401).json({
                code: 401,
                msg: "用户不存在"
            });
        }
        const user = u[0];
        const isValid = cryptoUtil.comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({
                code: 401,
                msg: "密码错误"
            });
        }
        const token = cryptoUtil.generateToken({ id: user.id, username: user.username });
        const j: JResposeType<UserApiLogin> = {
            code: 200,
            msg: "登录成功",
            data: {
                token,
                username: user.username,
                email: user.email

            }
        };
        return res.status(200).json(j);
    });
}
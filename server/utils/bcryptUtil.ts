import bcrypt from "bcryptjs";


class BcryptUtil {
    readonly saltCount: number = 10;
    salt = bcrypt.genSaltSync(this.saltCount);

    hasedPassword(pw: string) {
        return bcrypt.hashSync(pw, this.salt);
    }

    comparePassword(pw: string, hasedPw: string) {
        return bcrypt.compareSync(pw, hasedPw);
    }
}

export const bcryptUtil = new BcryptUtil();
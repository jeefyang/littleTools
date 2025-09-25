import { cryptoUtil } from "@server/utils/cryptoUtil";

type DecodeType<T extends { from?: any, to?: any; }> = {
    url: string;
    method: HttpMethod;
    type: T;
    /**  */
    getBody: (req: any) => T['from'];
    getQuery: (req: any) => T['from'];

    getResult: (o: Partial<JResposeType<T>>) => JResposeType<T>;

};

export class Base<T extends { from?: any, to?: any; }, D extends { [x in string]: {
    url: string;
    method: HttpMethod;
    type: T;
} }> {

    decode = {} as { [x in keyof D]: DecodeType<D[x]["type"]> };

    readonly statusMap = {
        /** 成功 */
        success: 200,
        /** 没权限 */
        noAuth: 401,
        /** 没数据 */
        noData: 404,
        /** 错误 */
        error: 500
    };

    constructor(public apiName: string, public apis: D) {
        this.initApis();
    }

    initApis() {
        for (const key in this.apis) {
            const api = this.apis[key as keyof D];
            this.decode[key as keyof D] = {
                url: this.getUrl(api.url),
                method: api.method,
                type: api.type,
                getBody: (req) => {
                    return req.body;
                },
                getQuery: (req) => {
                    return req.query;
                },
                getResult: (o) => {
                    return {
                        code: 200,
                        msg: "操作成功",
                        data: undefined,
                        ...o
                    };
                }
            };
        }
    }

    /** 校验token */
    verifyToken(req: any): boolean {
        const token = req.headers.token;
        if (!token) {
            return false;
        }
        return !!cryptoUtil.verifyToken(token);
    }

    getUrl(url: string) {
        return process.env.VITE_API_BASE_URL + url;
    }
}
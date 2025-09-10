
type DecodeType<T extends { from?: any, to?: any; }> = {
    url: string;
    method: HttpMethod;
    type: T;
    /**  */
    getBody: (req: any) => T['from'];
    getResult: (o: Partial<JResposeType<T>>) => JResposeType<T>;

};

export class Base<T extends { from?: any, to?: any; }, D extends { [x in string]: {
    url: string;
    method: HttpMethod;
    type: T;
} }> {

    decode = {} as { [x in keyof D]: DecodeType<D[x]["type"]> };

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


    getUrl(url: string) {
        return process.env.VITE_API_BASE_URL + url;
    }
}
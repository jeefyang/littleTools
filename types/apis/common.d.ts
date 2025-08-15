

type JHeaderType = {
    /** 请求方式 */
    'Content-Type': string;
    /** token */
    token?: string;
    /** 路径 */
    router?: string;
    /** 验证密钥 */
    authKey?: string;
};

type JResposeType<T extends { from: any, to: any; } = { from: any, to: any; }> = {
    code: number;
    data: T['to'];
    msg: string;
};

type JFetchApiType<T extends { from?: any, to: any; }> = undefined extends T['from'] ? (data?: T['from']) => Promise<JResposeType<T>> : (data: T['from']) => Promise<JResposeType<T>>;

interface RouterListApi {
    from?: {};
    to: { [x: string]: JRouterType; };
}
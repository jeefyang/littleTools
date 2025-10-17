
type JHeaderType = {
    /** 请求方式 */
    'Content-Type'?: string;
    /** token */
    token?: string;
    /** 路径 */
    router?: string;
    /** 验证密钥 */
    authKey?: string;
};

type JResposeType<T extends { to?: any; } = {}> = undefined extends T['to'] ? {
    code: number;
    msg: string;
} : {
    code: number;
    data: T['to'];
    msg: string;
};

type HttpMethod = "GET" | "POST";

interface RouterListApi {
    from?: {};
    to: { [x: string]: JRouterType; };
}

type JFetchOtherType = {
    /** 是否忽略登录 */
    ignoreLogin?: boolean;
};

type JFetchApiType<T extends { from?: any, to?: any; }> = undefined extends T['from'] ? (data?: T['from']) => Promise<JResposeType<T>> : (data: T['from'], other?: JFetchOtherType) => Promise<JResposeType<T>>;



type uploadFilePrivateType = 'markdown';
type uploadFileType = "xx";

type UploadFileReturnType = JResposeType<{
    to:
    {
        url: string;
        displayUrl: string;
        filename: string;
    };
}>;

type UploadFileDataType = {
    privateType?: uploadFilePrivateType;
    dir: string;
    type?: uploadFileType;
    filename?: string;
};


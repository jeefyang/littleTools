
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



type UploadFilePrivateType = 'markdown';
type UploadFileType = "xx";

type UploadFileReturnType = JResposeType<{
    to:
    {
        url: string;
        displayUrl: string;
        filename: string;
    };
}>;

type UploadFileRenameType = "uuid16" | "md5" | "forceName" | "time-uuid6" | "originName" | "md5-name" | "sha256" | "sha256-name" | "uuid6-name";

// 由于要解码,请使用string类型或者扩展
type UploadFileDataType = {
    privateType?: UploadFilePrivateType;
    dir?: string;
    type?: UploadFileType;
    override?: boolean;
    renameType?: UploadFileRenameType;
    forceName?: string;
    /** 进制,默认32进制,减少字符,只用于md5或者sha256 */
    binaryType?: "16" | "32";

};


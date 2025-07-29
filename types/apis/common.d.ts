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

type JFetchApiType<T extends { from: any, to: any; }> = (data: T['from']) => Promise<T['to']>;
class CommonUtils {
    /** 私有资源请求基础路径,非文件夹指向路径 */
    readonly privateResBaseUrl = "privateRes";
    /** 资源请求基础路径,非文件夹指向路径 */
    readonly resBaseUrl = "res";
    /** 上传请求基础路径,非文件夹指向路径 */
    readonly uploadBaseUrl = 'upload';
}

export const commonUtils = new CommonUtils();
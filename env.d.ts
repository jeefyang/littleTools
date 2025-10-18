/// <reference types="vite/client" />

type env = {
    /** api基础路径 */
    VITE_API_BASE_URL: string,
    /** 当前环境 */
    VITE_NODE_ENV: string;
    /** token */
    VITE_TOKEN: string;
    /** 网页端的 Vue 目录 */
    VITE_VUE_DIR: string;
    /** 资源目录 */
    VITE_RES_DIR: string;
    /** 私有资源目录 */
    VITE_PRIVATE_RES_DIR: string;
    /** 默认用户名 */
    VITE_INIT_LOGIN_USERNAME: string;
    /** 初始密码 */
    VITE_INIT_LOGIN_PASSWORD: string;
    /** 临时目录 */
    VITE_TEMP_DIR: string;
};

declare namespace NodeJS {
    interface ProcessEnv extends env { }

}

interface ImportMetaEnv extends env { }
/// <reference types="vite/client" />

type env = {
    VITE_NODE_ENV: string;
    VITE_TOKEN: string;
    /** 网页端的 Vue 目录 */
    VITE_VUE_DIR: string;
};

declare namespace NodeJS {
    interface ProcessEnv extends env { }

}

interface ImportMetaEnv extends env { }
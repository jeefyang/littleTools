/// <reference types="vite/client" />

type env = {
    VITE_NODE_ENV: string;
    VITE_TOKEN: string;
};

declare namespace NodeJS {
    interface ProcessEnv extends env { }

}

interface ImportMetaEnv extends env { }
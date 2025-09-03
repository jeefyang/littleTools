import type { Plugin, ResolvedConfig, TransformResult } from 'vite';
import fs from "node:fs";
import path from "node:path";



interface PluginOptions {
    prefix?: string;  // 自定义前缀，用于虚拟模块
    debug?: boolean;  // 是否启用调试日志

}


export default function keepAlivePlus(options: PluginOptions = {}): Plugin {

    return {
        name: 'vite-plugin-keep-alive-plus',
        transform(code, id) {
            if (code.includes('KeepAliveImpl =')) {
                const key = `KeepAliveImpl = `;
                const arr = code.split(key);

                let left = 0;
                let right = 0;
                let start = 0;
                let end = 0;
                for (let i = 0; i < arr[1].length; i++) {
                    if (arr[1][i] == '{') {
                        if (left == 0) {
                            start = i;
                        }
                        left++;
                    }
                    else if (arr[1][i] == '}') {
                        right++;
                        if (left == right) {
                            end = i;
                            break;

                        }
                    }
                }
                let target = arr[1].slice(start, end);
                // 定义变量
                const propsStr = target.match(/(\n\s*props:\s*{)/);
                if (propsStr && propsStr[0]) {
                    target = target.replace(propsStr[0], `
                    ${propsStr[0]}
                    initCacheKeyList:[Array],
                    `);
                }
                // 追加缓存监听逻辑
                const watchStr = target.match(/(\n\s*watch.*\()/);
                if (watchStr && watchStr[0]) {
                    target = target.replace(watchStr[0], `
                        // 追加监听逻辑
                        ${watchStr[0]}
                        ()=>props.initCacheKeyList,(initCacheKeyList)=>{
                                if(!initCacheKeyList){
                                    return
                                };
                                cache.forEach((vnode, key)=>{
                                    if(!initCacheKeyList.includes(key)){
                                        pruneCacheEntry(key)
                                    }   
                                })
                            },
                            { flush: 'post' },
                        )
                        // 原监听逻辑
                        ${watchStr[0]}
                        `);
                }

                console.log('\x1b[36m%s\x1b[0m', `篡改keepAlive:${id}`);
                const newCode = [arr[0], target + arr[1].slice(end)].join(key);
                return newCode;

            }
        }
    };
}
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import type { RouteLocationNormalizedLoadedGeneric, Router } from "vue-router";


export const useRouterStore = defineStore('router', () => {
    /** 路由列表 */
    const routerList = ref(<{
        absUrl: string;
        title: string;
        router: string;
        /** 是否多开 */
        isMulti: string;
        /** 是否重载 */
        isRenew: string;
        removeFn?: () => any;
    }[]>[]);
    /** 页面组件列表 */
    const views = import.meta.glob('../views/**/*.vue');
    /** 存储页面标签列表key */
    const sessionPagesKey = 'pages';
    /** 页面标签列表 */
    const pageList = ref(<{
        title: string;
        path: string;
        query: Record<string, string | number>;
        isMulti?: boolean;
        fullPath?: string;
        cachedPath?: string;
    }[]>[]);
    /** 当前页面 */
    const curPage = ref('');
    /** 页面标签列表数量发生改变的计数器 */
    const changePageListCount = ref(0);

    /** 读取页面标签 */
    const loadPages = (): typeof pageList.value => {
        const firstQuery: Record<string, string> = {};
        const firstPath = `/home/index`;
        return [
            { title: '首页', path: firstPath, isMulti: true, query: firstQuery, cachedPath: `${firstPath}?t=${firstQuery['t']}` },
            ...JSON.parse(sessionStorage.getItem(sessionPagesKey) || '[]'),
        ];
    };

    /** 保存页面标签 */
    const savePages = () => {
        sessionStorage.setItem(sessionPagesKey, JSON.stringify(pageList.value.slice(1)));
    };

    /** 获取页面组件 */
    const getView = (name: string) => {
        const view = views[`../views/${name}.vue`];

        if (!view) {
            throw Error(`视图不存在: ${name}`);
        }
        return view;
    };

    /** 初始化 */
    const init = async (router: Router) => {

        const res: {
            data: { [x in string]: typeof routerList.value[number] };
        } = await (await fetch('/api/routerList')).json();
        const list: typeof routerList.value = [];
        for (let key in res.data) {
            const item = res.data[key];
            let view = null;
            try {
                view = getView(item.router);
            } catch (e) {
                console.warn(`视图不存在: ${item.router}`);
            }
            if (!view) {
                continue;
            }
            const a = router.addRoute('/', {
                path: item.router,
                name: item.router,
                component: view,
                meta: {
                    title: item.title,
                    keepAlive: true,
                },
            });
            list.push({ ...item, removeFn: a });
        }
        routerList.value = list;
        // console.log(router.currentRoute.value);
        // await router.push("");
    };

    const getPath = (route: RouteLocationNormalizedLoadedGeneric) => {
        if (routerList.value.length == 0) {
            return route.path;
        }
        const c = routerList.value.find(c => '/' + c.router == route.path);
        if (!c) {
            return route.path;
        }
        if (c.isMulti) {
            return `${route.path}?t=${route.query['t']}`;
        }
    };

    return {
        routerList,
        getView,
        init,
        getPath,
        loadPages,
        savePages,
        curPage,
        pageList,
        changePageListCount
    };
});
import CommonApi from "@/apis/CommonApi";
import { jFetch } from "@/utils/jFetch";
import type { ArgumentsType } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import type { LocationQueryRaw, RouteLocationNormalizedLoadedGeneric, Router } from "vue-router";

type CurRouterType = JRouterType & {
    removeFn?: () => any;
};

export const useRouterStore = defineStore('router', () => {
    /** 路由列表 */
    const routerList = ref(<CurRouterType[]>[]);
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
    const routerToPush = ref(<ArgumentsType<Router['push']>[0]>{});


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
        routerList.value.forEach(c => {
            router.removeRoute(`/${c.router}`);
        });
        const res: {
            data: { [x in string]: typeof routerList.value[number] };
        } = await CommonApi.routerList();
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

    const getInitCacheKeyList = () => {
        return pageList.value.map(c => c.cachedPath);
    };

    const toItemRouter = (item: CurRouterType) => {
        const query: LocationQueryRaw = {};
        if (item.isMulti == '1' || item.isRenew == '1') {
            query.t = new Date().getTime();
        }
        routerToPush.value = { path: '/' + item.router, query };
    };

    const toUrl = (o: { url: string, query?: LocationQueryRaw; }) => {
        routerToPush.value = { path: o.url, query: o.query || {} };
    };

    /** 获取路由标签名 */
    const getRouterTitle = (router: CurRouterType, query: LocationQueryRaw | string) => {
        const arr = router.title.split('$');
        if (arr.length == 1) {
            return arr[0];
        }
        if (typeof query == 'string') {
            return router.title;
        }
        return query[arr[1]] || "";
    };

    /** 获取路由key */
    const getRouterKey = (router: CurRouterType | string, query: LocationQueryRaw | string) => {
        if (typeof router == 'string') {
            return router + '?t=' + ((query as { t: string; })['t'] || "");
        }
        let key = '/' + router.router + '?';
        if (typeof query != 'string' && router?.secondName) {
            key += router.secondName + '=' + (query[router.secondName] || '') + '&';
        }
        return key + `t=${(query as { t: string; })['t']}`;
    };



    return {
        /** 可用的路由列表 */
        routerList,
        getView,
        init,
        getPath,
        loadPages,
        savePages,
        /** 当前页面 */
        curPage,
        /** 页面列表 */
        pageList,
        changePageListCount,
        getInitCacheKeyList,
        toItemRouter,
        toUrl,
        routerToPush,
        /** 获取路由标签名 */
        getRouterTitle,
        /** 获取路由key */
        getRouterKey
    };
});
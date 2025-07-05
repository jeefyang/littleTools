import { defineStore } from "pinia";
import { ref } from "vue";
import type { Router } from "vue-router";


export const useRouterStore = defineStore('router', () => {
    const routerList = ref(<{ absUrl: string, title: string, router: string; }[]>[]);
    const views = import.meta.glob('../views/**/*.vue');

    const getView = (name: string) => {
        const view = views[`../views/${name}.vue`];

        if (!view) {
            throw Error(`视图不存在: ${name}`);
        }
        return view;
    };

    const init = async (router: Router) => {

        const res: {
            data: { [x in string]: any };
        } = await (await fetch('/api/routerList')).json();
        const list = [];
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
            list.push(item);
            router.addRoute('/', {
                path: item.router,
                name: item.router,
                component: view,
                meta: {
                    title: item.title,
                    keepAlive: true,
                },
            });
        }
        routerList.value = list;
        await router.push('');
    };

    return {
        routerList,
        getView,
        init
    };
});
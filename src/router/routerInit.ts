import type { Router } from "vue-router";

export class RouterInit {

    static views = import.meta.glob('../views/**/*.vue');


    static getView = (name: string) => {
        const view = RouterInit.views[`../views/${name}.vue`];

        if (!view) {
            throw Error(`视图不存在: ${name}`);
        }
        return view;
    };

    static async init(router: Router) {
        const res: {
            data: { [x in string]: any };
        } = await (await fetch('/api/routerList')).json();

        for (let key in res.data) {
            const item = res.data[key];
            let view = null;
            try {
                view = RouterInit.getView(item.router);
            } catch (e) {
                console.warn(`视图不存在: ${item.router}`);
            }
            if (!view) {
                continue;
            }
            console.log({
                path: item.router,
                name: item.router,
                component: view,
                meta: {
                    title: item.title,
                    keepAlive: true,
                },
            });
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
        await router.push('');
    }



}
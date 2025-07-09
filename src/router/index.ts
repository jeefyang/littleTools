import { useRouterStore } from '@/stores/routerStore';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: '/',
            component: () => import('../views/common/layout.vue'),
            redirect: '/home/index',
            children: []
        },
        {
            path: '/:catchAll(.*)',
            name: '404',
            component: () => import('../views/common/404.vue'),
        },
    ],
});

let isInit = false;
router.beforeEach(async (to, from, next) => {
    if (!isInit) {
        isInit = true;
        const routeStore = useRouterStore();
        await routeStore.init(router);
        router.push(to.fullPath);
    }
    next(true);
});


export default router;

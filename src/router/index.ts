import { createRouter, createWebHistory } from 'vue-router';
import { RouterInit } from './routerInit';



const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: '/',
            component: RouterInit.getView('common/layout'),
            redirect: '/home/index',
            children: []
        },
        {
            path: '/:catchAll(.*)',
            name: '404',
            component: RouterInit.getView('common/404'),
        },
    ],
});


export default router;

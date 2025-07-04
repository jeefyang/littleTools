import { createRouter, createWebHistory } from 'vue-router';

const views = import.meta.glob('../views/**/*.vue');
console.log('所有视图:', views);
const getView = (name: string) => {
    const view = views[`../views/${name}.vue`];

    if (!view) {
        throw new Error(`视图不存在: ${name}`);
    }
    console.log(`加载视图: ${name}`, view);
    return view;
};
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: '/',
            component: getView('common/layout'),
            redirect: '/home/index',
            children: []
        },
        {
            path: '/:catchAll(.*)',
            name: '404',
            component: getView('common/404'),
        },
    ],
});

export default router;

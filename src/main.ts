// import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';


import App from './App.vue';
import router from './router';
import {
    create,
    NTabs,
    NTabPane,
    NGlobalStyle,
    NConfigProvider,
    NFloatButton,
    NIcon,
    NModal,
    NButton,
} from "naive-ui";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(create({
    components: [
        NTabPane,
        NTabs,
        NGlobalStyle,
        NConfigProvider,
        NFloatButton,
        NIcon,
        NModal,
        NButton
    ]
}));

app.mount('#app');

export default app;

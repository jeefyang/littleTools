// import './assets/main.css';

import { createApp, getCurrentInstance } from 'vue';
import { createPinia } from 'pinia';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';
import 'virtual:uno.css';



import App from './App.vue';
import router from './router';


const app = createApp(App);

app.use(createPinia());
app.use(router);



app.mount('#app');


export default app;

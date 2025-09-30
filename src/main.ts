// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000';

const app = createApp(App);

app.use(router);

app.config.globalProperties.$axios = axios;

app.mount('#app');

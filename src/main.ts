import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

const app = createApp(App);

app.use(router);

app.config.globalProperties.$axios = api;

app.mount('#app');

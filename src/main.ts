import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import api from './services/api'; // usa a instância já configurada do axios

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const app = createApp(App);

app.use(router);

// ✅ Substitui $axios pelo api configurado
app.config.globalProperties.$axios = api;

app.mount('#app');

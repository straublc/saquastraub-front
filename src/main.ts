// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// Bootstrap JS
import 'bootstrap'
// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

createApp(App).use(router).mount('#app')

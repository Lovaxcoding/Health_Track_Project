import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // On importe notre nouveau fichier
import './style.css' // Ou ton fichier tailwind

const app = createApp(App)

app.use(router) // On active le router
app.mount('#app')
import './assets/main.css'
import './assets/index.css'
import 'primevue/resources/themes/lara-light-green/theme.css'

import { createApp } from 'vue'

import ProgressBar from 'primevue/progressbar'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.component('Progress', ProgressBar)

app.mount('#app')

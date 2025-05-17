import '@/assets/common.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import directives from './utils/directives'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 注册全局自定义指令
app.directive('auth', directives.auth)

app.mount('#app')

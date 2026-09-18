import { createSSRApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from './router'
import './style.css'

// 应用工厂：客户端与 SSR 共用（history 模式由入口注入）
export function createApp(history) {
  const app = createSSRApp(App)
  const router = createAppRouter(history)
  app.use(router)
  return { app, router }
}

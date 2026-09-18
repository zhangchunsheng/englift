import { createApp } from './main'

// 客户端入口：hydrate 预渲染的 HTML（无预渲染内容时等同普通挂载）
const { app, router } = createApp()
router.isReady().then(() => app.mount('#app'))

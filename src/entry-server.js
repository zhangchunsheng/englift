import { createMemoryHistory } from 'vue-router'
import { renderToString } from '@vue/server-renderer'
import { createApp } from './main'

// SSR 入口：渲染指定路由为 HTML 字符串，并返回该路由的 meta
export async function render(url) {
  const { app, router } = createApp(createMemoryHistory())
  await router.push(url)
  await router.isReady()
  const html = await renderToString(app)
  const { title, description } = router.currentRoute.value.meta
  return { html, title, description }
}

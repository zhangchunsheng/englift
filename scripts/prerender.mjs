/**
 * 静态预渲染（SSG）：构建客户端 + SSR 包，把每个路由渲染成真实 HTML，
 * 让搜索引擎与 AI 爬虫无需执行 JS 即可读取完整内容。
 */
import { build } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SITE = 'https://englift.luomor.com'
const routes = ['/', '/tenses', '/verbs', '/prepositions', '/phonemes', '/sentences', '/quiz', '/mistakes']

console.log('▶ 1/3 构建客户端包…')
await build({ logLevel: 'warn' })

console.log('▶ 2/3 构建 SSR 包…')
await build({
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.js', outDir: 'dist-server', emptyOutDir: true },
})

console.log('▶ 3/3 渲染静态页面…')
const { render } = await import(pathToFileURL(path.resolve('dist-server/entry-server.js')).href)
const template = fs.readFileSync('dist/index.html', 'utf-8')

for (const route of routes) {
  const { html, title, description } = await render(route)
  const url = `${SITE}${route === '/' ? '/' : route}`

  let page = template
    .replace('<div id="app"></div>', `<div id="app">${html}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title} · EngLift 英语实验室</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${description}$2`
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${title} · EngLift 英语实验室$2`
    )
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)

  const file = route === '/' ? 'dist/index.html' : `dist${route}/index.html`
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, page)
  console.log(`  ✓ ${route} → ${file}`)
}

fs.rmSync('dist-server', { recursive: true, force: true })
console.log('✔ 预渲染完成')

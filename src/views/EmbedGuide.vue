<script setup>
import { ref, computed } from 'vue'

const BASE = 'https://englift.luomor.com'

const level = ref('random')
const levels = [
  { value: 'random', label: '随机级别（默认）' },
  { value: 'xiaoxue', label: '小学英语' },
  { value: 'chuzhong', label: '初中英语' },
  { value: 'gaozhong', label: '高中英语' },
  { value: 'cet4', label: '英语四级' },
  { value: 'cet6', label: '英语六级' },
  { value: 'kaoyan', label: '考研英语' },
]

const embedUrl = computed(() =>
  level.value === 'random' ? `${BASE}/embed/word` : `${BASE}/embed/word?level=${level.value}`
)
const embedCode = computed(
  () => `<iframe src="${embedUrl.value}" width="320" height="300" frameborder="0" style="border-radius:16px"></iframe>`
)
const responsiveCode = computed(
  () => `<iframe src="${embedUrl.value}" style="width:100%;min-width:240px;height:300px;border-radius:16px" frameborder="0"></iframe>`
)

// 复制代码
const copied = ref('')
async function copy(text, key) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => (copied.value = ''), 1500)
  } catch {
    // 剪贴板不可用时退化为选中文本
    copied.value = ''
  }
}

const sizes = [
  { name: '窄侧栏', size: '240 × 320', note: '适合较窄的侧边栏' },
  { name: '标准侧栏', size: '280 × 300', note: '推荐尺寸' },
  { name: '宽侧栏', size: '320 × 300', note: '默认代码尺寸' },
  { name: '正文区域', size: 'width:100%; height:300px', note: '响应式自适应容器' },
]

const faqs = [
  {
    q: '嵌入后页面空白 / 不显示？',
    a: '① 检查你的网站是否允许 iframe（部分主题/插件会过滤）；② 广告拦截插件可能误拦，请关闭后刷新；③ 确认你的站点能通过 HTTPS 访问 englift.luomor.com。',
  },
  {
    q: '如何调整卡片尺寸？',
    a: '修改 iframe 的 width / height 属性，或用 style="width:100%" 让卡片宽度自适应容器。卡片内部排版会自动适配。',
  },
  {
    q: '每次访问显示同一个单词吗？',
    a: '每次加载 iframe 都会随机抽取一个新单词；访客点击卡片上的「🎲 换一个」可以不刷新页面继续抽词。',
  },
  {
    q: '可以只显示某个级别的词库吗？',
    a: '可以，在地址后加 ?level= 参数：xiaoxue（小学）/ chuzhong（初中）/ gaozhong（高中）/ cet4（四级）/ cet6（六级）/ kaoyan（考研）。不加则每次随机一个级别。',
  },
  {
    q: '发音功能需要联网吗？',
    a: '发音使用访客浏览器自带的语音合成，无需额外服务；几乎所有现代浏览器（Chrome/Edge/Safari）都支持。',
  },
]
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <header class="mb-6">
      <h1 class="font-display text-2xl font-bold text-pine">把「随机单词」嵌入你的网站</h1>
      <p class="mt-1 text-sm text-ink/60">
        一行 iframe 代码，把 EngLift 随机单词卡片嵌入到你的博客或网站（WordPress、Typecho、静态站均可），访客可以直接听单词发音。
      </p>
    </header>

    <!-- 1. 快速开始 -->
    <section class="card p-5">
      <h2 class="text-lg font-bold">① 快速开始</h2>
      <p class="mt-1 text-sm text-ink/60">复制下面的代码，粘贴到你网站的任意 HTML 位置：</p>
      <div class="relative mt-3">
        <pre class="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-6 text-paper" lang="html">{{ embedCode }}</pre>
        <button class="btn absolute right-3 top-3 bg-paper/15 text-xs text-paper hover:bg-paper/25" @click="copy(embedCode, 'main')">
          {{ copied === 'main' ? '✓ 已复制' : '复制代码' }}
        </button>
      </div>

      <div class="mt-4">
        <p class="text-sm text-ink/60">选择词库级别：</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="l in levels"
            :key="l.value"
            class="tag border transition"
            :class="level === l.value ? 'border-pine bg-pine text-paper' : 'border-ink/15 bg-white text-ink/60 hover:border-pine'"
            @click="level = l.value"
          >{{ l.label }}</button>
        </div>
      </div>
    </section>

    <!-- 2. 效果预览 -->
    <section class="card mt-5 p-5">
      <h2 class="text-lg font-bold">② 效果预览</h2>
      <p class="mt-1 text-sm text-ink/60">这就是访客看到的样子（可以点击试用）：</p>
      <div class="mt-3 flex justify-center">
        <iframe :src="embedUrl" width="320" height="300" frameborder="0" style="border-radius:16px" title="随机单词卡片预览" />
      </div>
    </section>

    <!-- 3. WordPress 添加步骤 -->
    <section class="card mt-5 p-5">
      <h2 class="text-lg font-bold">③ WordPress 添加步骤</h2>
      <ol class="mt-3 list-inside list-decimal space-y-2 text-sm leading-7 text-ink/70">
        <li>登录 WordPress 后台</li>
        <li>进入「外观 → 小工具」（Widgets）</li>
        <li>点击「+」添加一个「自定义 HTML」小工具</li>
        <li>粘贴上面复制的代码，保存</li>
        <li>刷新你的网站首页，侧栏即可看到单词卡片</li>
      </ol>
      <p class="mt-2 text-xs text-ink/40">
        其他系统：Typecho / Halo 在「外观 → 侧边栏」添加 HTML 模块；静态网站直接把代码粘进页面 HTML。
      </p>
    </section>

    <!-- 4. 尺寸调整 -->
    <section class="card mt-5 p-5">
      <h2 class="text-lg font-bold">④ 尺寸调整</h2>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[480px] text-sm">
          <thead>
            <tr class="border-b border-ink/10 text-left text-xs text-ink/40">
              <th class="py-2 pr-4">场景</th>
              <th class="py-2 pr-4">宽度 × 高度</th>
              <th class="py-2">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sizes" :key="s.name" class="border-b border-ink/5 last:border-0">
              <td class="py-2 pr-4 font-medium">{{ s.name }}</td>
              <td class="py-2 pr-4 font-mono text-xs">{{ s.size }}</td>
              <td class="py-2 text-ink/60">{{ s.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-sm text-ink/60">响应式版本（宽度自适应容器）：</p>
      <div class="relative mt-2">
        <pre class="overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-6 text-paper" lang="html">{{ responsiveCode }}</pre>
        <button class="btn absolute right-3 top-3 bg-paper/15 text-xs text-paper hover:bg-paper/25" @click="copy(responsiveCode, 'resp')">
          {{ copied === 'resp' ? '✓ 已复制' : '复制代码' }}
        </button>
      </div>
    </section>

    <!-- 5. 常见问题 -->
    <section class="card mt-5 p-5">
      <h2 class="text-lg font-bold">⑤ 常见问题</h2>
      <div class="mt-3 space-y-3">
        <details v-for="f in faqs" :key="f.q" class="rounded-xl border border-ink/10 p-4">
          <summary class="cursor-pointer text-sm font-medium">{{ f.q }}</summary>
          <p class="mt-2 text-sm leading-7 text-ink/60">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <p class="mt-6 text-center text-xs text-ink/40">
      卡片内容来自 EngLift 词库（小学至考研共 16,129 词），完全免费，无需注册。
    </p>
  </div>
</template>

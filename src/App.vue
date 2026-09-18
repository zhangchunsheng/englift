<script setup>
import { ref } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { progress } from './stores/progress'

const route = useRoute()
const nav = [
  { to: '/', label: '学习目录', exact: true },
  { to: '/tenses', label: '时态' },
  { to: '/verbs', label: '词形' },
  { to: '/prepositions', label: '介词地图' },
  { to: '/phonemes', label: '音标' },
  { to: '/sentences', label: '句子拆解' },
  { to: '/words', label: '随机单词' },
  { to: '/quiz', label: '练习' },
]
const open = ref(false)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <RouterLink to="/" class="flex items-baseline gap-2">
          <span class="font-display text-xl font-bold text-pine">EngLift</span>
          <span class="hidden text-xs tracking-widest text-ink/50 sm:inline">ENGLISH VISUAL LAB</span>
        </RouterLink>

        <nav class="hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-1.5 text-sm text-ink/70 transition hover:bg-pine/10 hover:text-pine"
            :class="{ 'bg-pine text-paper hover:bg-pine hover:text-paper': item.exact ? route.path === '/' : route.path.startsWith(item.to) }"
          >
            {{ item.label }}
          </RouterLink>
          <RouterLink
            to="/mistakes"
            class="relative rounded-lg px-3 py-1.5 text-sm text-ink/70 transition hover:bg-clay/10 hover:text-clay"
            :class="{ 'bg-clay text-paper hover:bg-clay hover:text-paper': route.path === '/mistakes' }"
          >
            错题本
            <span
              v-if="progress.mistakes.length"
              class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white"
            >{{ progress.mistakes.length }}</span>
          </RouterLink>
        </nav>

        <button class="btn-ghost md:hidden" @click="open = !open" aria-label="菜单">
          {{ open ? '✕' : '☰' }}
        </button>
      </div>

      <nav v-if="open" class="border-t border-ink/10 bg-paper px-4 py-2 md:hidden">
        <RouterLink
          v-for="item in [...nav, { to: '/mistakes', label: '错题本' }]"
          :key="item.to"
          :to="item.to"
          class="block rounded-lg px-3 py-2 text-sm text-ink/70 hover:bg-pine/10"
          @click="open = false"
        >
          {{ item.label }}
          <span v-if="item.to === '/mistakes' && progress.mistakes.length" class="tag bg-clay/15 text-clay">
            {{ progress.mistakes.length }}
          </span>
        </RouterLink>
      </nav>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <footer class="border-t border-ink/10 py-6 text-center text-xs text-ink/40">
      EngLift · 英语可视化实验室 — 时间线 / 词形 / 介词地图 / 音标图谱 / 句子拆解 / 配套练习
    </footer>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
}
</style>

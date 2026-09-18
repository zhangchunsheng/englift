<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { progress, removeMistake, clearMistakes, markVisit } from '../stores/progress'

onMounted(() => markVisit('mistakes'))

const showAnswer = ref({})
const filter = ref('all')

const topics = computed(() => [...new Set(progress.mistakes.map((m) => m.topic))])
const list = computed(() =>
  filter.value === 'all' ? progress.mistakes : progress.mistakes.filter((m) => m.topic === filter.value)
)

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div>
    <header class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-clay">错题本</h1>
        <p class="mt-1 text-sm text-ink/60">做错的题自动收进来。看提示回忆答案，掌握后手动移除。</p>
      </div>
      <button
        v-if="progress.mistakes.length"
        class="btn-ghost text-xs text-clay"
        @click="confirm('清空全部错题？') && clearMistakes()"
      >清空错题本</button>
    </header>

    <div v-if="topics.length" class="mb-4 flex flex-wrap gap-2">
      <button
        class="tag border"
        :class="filter === 'all' ? 'border-clay bg-clay text-paper' : 'border-ink/15 bg-white text-ink/60'"
        @click="filter = 'all'"
      >全部（{{ progress.mistakes.length }}）</button>
      <button
        v-for="t in topics"
        :key="t"
        class="tag border"
        :class="filter === t ? 'border-clay bg-clay text-paper' : 'border-ink/15 bg-white text-ink/60'"
        @click="filter = t"
      >{{ t }}（{{ progress.mistakes.filter((m) => m.topic === t).length }}）</button>
    </div>

    <div v-if="list.length" class="space-y-3">
      <div v-for="m in list" :key="m.id" class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 text-xs text-ink/40">
              <span class="tag bg-clay/10 text-clay">{{ m.topic }}</span>
              <span>{{ formatTime(m.ts) }}</span>
            </div>
            <p class="mt-2 font-medium leading-7" lang="en">{{ m.prompt }}</p>
            <p v-if="m.hint" class="mt-1 text-xs text-ink/40">💡 {{ m.hint }}</p>

            <div class="mt-3">
              <button
                v-if="!showAnswer[m.id]"
                class="btn-ghost text-xs"
                @click="showAnswer[m.id] = true"
              >显示答案</button>
              <div v-else class="rounded-xl bg-paper px-4 py-3 text-sm">
                <p>你的答案：<span class="font-mono text-clay line-through">{{ m.chosen || '（未作答）' }}</span></p>
                <p class="mt-1">正确答案：<span class="font-mono font-bold text-pine" lang="en">{{ m.answer }}</span></p>
              </div>
            </div>
          </div>
          <button
            class="btn-ghost shrink-0 text-xs"
            title="已掌握，移出错题本"
            @click="removeMistake(m.id)"
          >✓ 已掌握</button>
        </div>
      </div>
    </div>

    <div v-else class="card p-12 text-center">
      <p class="text-4xl">🌱</p>
      <p class="mt-3 text-ink/60">错题本是空的——去做几组练习吧。</p>
      <RouterLink to="/quiz" class="btn-primary mt-4">去练习 →</RouterLink>
    </div>
  </div>
</template>

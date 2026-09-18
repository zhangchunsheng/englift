<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { verbs, verbTypes } from '../data/verbs'
import { markVisit } from '../stores/progress'
import { speak } from '../utils/speech'
import SpeakScore from '../components/SpeakScore.vue'

onMounted(() => markVisit('verbs'))

const mode = ref('table') // table | cards
const query = ref('')
const typeFilter = ref('all')

const filtered = computed(() =>
  verbs.filter((v) => {
    const q = query.value.trim().toLowerCase()
    const matchQ =
      !q ||
      v.base.includes(q) ||
      v.past.toLowerCase().includes(q) ||
      v.pp.toLowerCase().includes(q) ||
      v.zh.includes(q)
    return matchQ && (typeFilter.value === 'all' || v.type === typeFilter.value)
  })
)

// 翻卡模式
const cardIndex = ref(0)
const flipped = ref(false)
const cardList = computed(() => filtered.value)
const card = computed(() => cardList.value[cardIndex.value % Math.max(cardList.value.length, 1)])
function nextCard() {
  flipped.value = false
  cardIndex.value = (cardIndex.value + 1) % cardList.value.length
}
function prevCard() {
  flipped.value = false
  cardIndex.value = (cardIndex.value - 1 + cardList.value.length) % cardList.value.length
}

const typeColor = { AAA: '#8fb996', ABB: '#e8a33d', ABA: '#3d6ec6', ABC: '#c65f3d' }
</script>

<template>
  <div>
    <header class="mb-5">
      <h1 class="font-display text-2xl font-bold text-pine">词形变化 · 不规则动词</h1>
      <p class="mt-1 text-sm text-ink/60">
        别只背词尾变化——把动词按变化规律分成四组，例句并排读。完整表可按原形、过去式、过去分词或中文检索。
      </p>
    </header>

    <!-- 规律分组说明 -->
    <div class="mb-5 grid gap-3 sm:grid-cols-4">
      <button
        v-for="t in verbTypes"
        :key="t.key"
        class="card p-3 text-left transition hover:border-pine/40"
        :class="{ 'ring-2 ring-pine': typeFilter === t.key }"
        @click="typeFilter = typeFilter === t.key ? 'all' : t.key"
      >
        <p class="font-mono font-bold" :style="{ color: typeColor[t.key] }">{{ t.key }}</p>
        <p class="text-sm font-medium">{{ t.label }}</p>
        <p class="mt-1 font-mono text-xs text-ink/40">{{ t.desc }}</p>
        <p class="mt-1 text-xs text-ink/40">{{ verbs.filter((v) => v.type === t.key).length }} 个</p>
      </button>
    </div>

    <!-- 工具栏 -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <input
        v-model="query"
        type="search"
        placeholder="检索：原形 / 过去式 / 过去分词 / 中文…"
        class="w-full max-w-sm rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm outline-none focus:border-pine"
      />
      <div class="ml-auto flex rounded-xl border border-ink/15 bg-white p-1 text-sm">
        <button
          class="rounded-lg px-3 py-1"
          :class="mode === 'table' ? 'bg-pine text-paper' : 'text-ink/60'"
          @click="mode = 'table'"
        >表格</button>
        <button
          class="rounded-lg px-3 py-1"
          :class="mode === 'cards' ? 'bg-pine text-paper' : 'text-ink/60'"
          @click="mode = 'cards'"
        >翻卡记忆</button>
      </div>
      <span class="text-xs text-ink/40">共 {{ filtered.length }} 个</span>
    </div>

    <!-- 表格模式 -->
    <div v-if="mode === 'table'" class="card overflow-x-auto">
      <table class="w-full min-w-[640px] text-sm">
        <thead>
          <tr class="border-b border-ink/10 text-left text-xs text-ink/40">
            <th class="px-4 py-3">原形</th>
            <th class="px-4 py-3">过去式</th>
            <th class="px-4 py-3">过去分词</th>
            <th class="px-4 py-3">中文</th>
            <th class="px-4 py-3">规律</th>
            <th class="px-4 py-3">例句</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in filtered" :key="v.base" class="border-b border-ink/5 last:border-0 hover:bg-pine/5">
            <td class="px-4 py-2.5 font-mono font-bold text-pine">{{ v.base }}</td>
            <td class="px-4 py-2.5 font-mono">{{ v.past }}</td>
            <td class="px-4 py-2.5 font-mono">{{ v.pp }}</td>
            <td class="px-4 py-2.5 text-ink/70">{{ v.zh }}</td>
            <td class="px-4 py-2.5">
              <span class="tag" :style="{ backgroundColor: typeColor[v.type] + '22', color: typeColor[v.type] }">{{ v.type }}</span>
            </td>
            <td class="px-4 py-2.5">
              <button class="text-ink/40 transition hover:text-pine" @click="speak(`${v.base}. ${v.past}. ${v.pp}.`)" aria-label="朗读三态">🔊</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="p-8 text-center text-sm text-ink/40">没有匹配的动词</p>
    </div>

    <!-- 翻卡模式 -->
    <div v-else class="mx-auto max-w-md">
      <div
        class="card flex h-64 cursor-pointer flex-col items-center justify-center p-6 text-center transition hover:shadow-lg"
        @click="flipped = !flipped"
      >
        <template v-if="card">
          <p class="text-xs text-ink/40">{{ cardIndex % cardList.length + 1 }} / {{ cardList.length }} · 点击翻面</p>
          <p class="font-display mt-3 text-4xl font-bold text-pine">{{ card.base }}</p>
          <p class="mt-1 text-sm text-ink/50">{{ card.zh }}</p>
          <div v-if="flipped" class="mt-5">
            <p class="font-mono text-xl">{{ card.past }} · {{ card.pp }}</p>
            <span class="tag mt-2" :style="{ backgroundColor: typeColor[card.type] + '22', color: typeColor[card.type] }">{{ card.type }} 型</span>
            <p class="mt-3 text-sm text-ink/60" lang="en">{{ card.example.en }}</p>
            <p class="text-xs text-ink/40">{{ card.example.zh }}</p>
          </div>
          <p v-else class="mt-5 text-sm text-ink/30">过去式？过去分词？</p>
        </template>
        <p v-else class="text-ink/40">当前筛选下没有动词</p>
      </div>
      <div class="mt-4 flex justify-center gap-3">
        <button class="btn-ghost" @click="prevCard">← 上一个</button>
        <button class="btn-ghost" @click="speak(card ? `${card.base}. ${card.past}. ${card.pp}.` : '')">🔊 朗读</button>
        <button class="btn-primary" @click="nextCard">下一个 →</button>
      </div>
      <!-- 跟读例句评分 -->
      <div v-if="card" class="mt-4 flex justify-center">
        <SpeakScore :key="card.base" :text="card.example.en" />
      </div>
    </div>

    <div class="mt-5 flex justify-end">
      <RouterLink to="/quiz/verbs" class="btn-primary">做词形练习 →</RouterLink>
    </div>
  </div>
</template>

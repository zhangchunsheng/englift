<script setup>
import { ref, onMounted } from 'vue'
import { markVisit } from '../stores/progress'
import { speak } from '../utils/speech'
import SpeakScore from '../components/SpeakScore.vue'

// ===== 本地词库索引（16,129 词，按需懒加载合并） =====
const LEVELS = ['xiaoxue', 'chuzhong', 'gaozhong', 'cet4', 'cet6', 'kaoyan']
const LEVEL_LABEL = {
  xiaoxue: '小学', chuzhong: '初中', gaozhong: '高中',
  cet4: '四级', cet6: '六级', kaoyan: '考研',
}
let indexPromise = null

function ensureIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      const map = new Map()
      for (const lv of LEVELS) {
        const bank = (await import(`../data/wordbank/${lv}.json`)).default
        for (const w of bank.words) {
          const key = w.word.toLowerCase()
          const hit = map.get(key)
          if (hit) {
            hit.levels.push(LEVEL_LABEL[lv])
            if (!hit.phonetic && w.phonetic) hit.phonetic = w.phonetic
            if (w.meaning && !hit.meanings.includes(w.meaning)) hit.meanings.push(w.meaning)
            if (!hit.example && w.example) {
              hit.example = w.example
              hit.exampleZh = w.exampleZh
            }
          } else {
            map.set(key, {
              word: w.word,
              phonetic: w.phonetic,
              meanings: w.meaning ? [w.meaning] : [],
              example: w.example,
              exampleZh: w.exampleZh,
              levels: [LEVEL_LABEL[lv]],
            })
          }
        }
      }
      return map
    })()
  }
  return indexPromise
}

// ===== 查询 =====
const query = ref('')
const loading = ref(false)
const entry = ref(null) // 统一结构：{ word, phonetic, audio, meanings[], examples[], levels[], source }
const notFound = ref(false)
const apiDetail = ref(null) // 在线词典的英英释义（本地命中时按需展开）

async function search() {
  const q = query.value.trim().toLowerCase()
  if (!q) return
  loading.value = true
  entry.value = null
  notFound.value = false
  apiDetail.value = null
  try {
    const index = await ensureIndex()
    const hit = index.get(q)
    if (hit) {
      entry.value = {
        word: hit.word,
        phonetic: hit.phonetic,
        audio: '',
        meanings: hit.meanings,
        examples: hit.example ? [{ en: hit.example, zh: hit.exampleZh }] : [],
        levels: hit.levels,
        source: 'local',
      }
    } else {
      await searchApi(q, true)
    }
  } finally {
    loading.value = false
  }
}

// 在线词典：经本站 PHP 代理转发 api.dictionaryapi.dev（解决浏览器 CORS 限制）
async function searchApi(q, asPrimary = false) {
  try {
    const res = await fetch(`/api/dict.php?word=${encodeURIComponent(q)}`)
    if (!res.ok) throw new Error('not found')
    const data = await res.json()
    const first = data[0]
    const phonetic =
      first.phonetic || first.phonetics?.find((p) => p.text)?.text || ''
    const audio = first.phonetics?.find((p) => p.audio)?.audio || ''
    const meanings = []
    const examples = []
    for (const m of data.flatMap((d) => d.meanings || [])) {
      const defs = (m.definitions || []).slice(0, 3)
      for (const d of defs) {
        meanings.push(`${m.partOfSpeech}. ${d.definition}`)
        if (d.example) examples.push({ en: d.example, zh: '' })
      }
    }
    const result = {
      word: first.word,
      phonetic,
      audio,
      meanings: meanings.slice(0, 8),
      examples: examples.slice(0, 3),
      levels: [],
      source: 'api',
    }
    if (asPrimary) {
      entry.value = result
    } else {
      apiDetail.value = result
    }
  } catch {
    if (asPrimary) notFound.value = true
    else apiDetail.value = { error: true }
  }
}

function onEnter(e) {
  if (e.key === 'Enter') search()
}

// ===== 发音播放（优先在线真人音频，否则语音合成） =====
const speaking = ref('')

function playWord() {
  if (speaking.value) {
    window.speechSynthesis.cancel()
    speaking.value = ''
    return
  }
  if (entry.value?.audio) {
    speaking.value = 'word'
    const a = new Audio(entry.value.audio)
    a.onended = a.onerror = () => (speaking.value = '')
    a.play().catch(() => {
      speaking.value = ''
      playSynth(entry.value.word)
    })
  } else {
    playSynth(entry.value?.word)
  }
}

function playSynth(text) {
  if (!text) return
  const u = speak(text)
  if (!u) return
  u.onstart = () => (speaking.value = 'word')
  u.onend = u.onerror = () => (speaking.value = '')
}

function playExample(text) {
  if (speaking.value === 'ex') {
    window.speechSynthesis.cancel()
    speaking.value = ''
    return
  }
  const u = speak(text)
  if (!u) return
  u.onstart = () => (speaking.value = 'ex')
  u.onend = u.onerror = () => (speaking.value = '')
}

onMounted(() => markVisit('dict'))
</script>

<template>
  <div>
    <header class="mb-5">
      <h1 class="font-display text-2xl font-bold text-pine">英语词典</h1>
      <p class="mt-1 text-sm text-ink/60">
        输入单词查释义和例句：本地 8,174 词（六个级别词库去重合并）离线秒查，查不到时自动联网查在线词典（含真人发音与英英释义）。
      </p>
    </header>

    <!-- 搜索框 -->
    <div class="mx-auto flex max-w-xl gap-2">
      <input
        v-model="query"
        type="search"
        placeholder="输入英语单词，回车查询…"
        class="flex-1 rounded-xl border border-ink/15 bg-white px-4 py-3 text-lg outline-none focus:border-pine"
        lang="en"
        autofocus
        @keydown="onEnter"
      />
      <button class="btn-primary px-6" @click="search">查询</button>
    </div>

    <p v-if="loading" class="py-12 text-center text-sm text-ink/40">查询中…</p>

    <!-- 未找到 -->
    <div v-else-if="notFound" class="card mx-auto mt-6 max-w-xl p-8 text-center">
      <p class="text-3xl">🔍</p>
      <p class="mt-3 text-ink/60">
        没有找到「<b lang="en">{{ query }}</b>」。检查拼写，或试试词的原形（如 went → go）。
      </p>
    </div>

    <!-- 词条卡片 -->
    <div v-else-if="entry" class="card mx-auto mt-6 max-w-xl p-8">
      <div class="text-center">
        <p class="font-display text-4xl font-bold text-pine" lang="en">{{ entry.word }}</p>
        <p v-if="entry.phonetic" class="mt-2 font-mono text-lg text-ink/50">{{ entry.phonetic }}</p>
        <div v-if="entry.levels.length" class="mt-2 flex justify-center gap-1.5">
          <span v-for="lv in entry.levels" :key="lv" class="tag bg-sun/15 text-[#b07c22]">{{ lv }}词库</span>
        </div>
        <p class="mt-1 text-xs text-ink/30">
          {{ entry.source === 'local' ? '本地词库' : '在线词典 dictionaryapi.dev' }}
        </p>
      </div>

      <!-- 释义 -->
      <div class="mt-5">
        <p class="text-xs font-bold text-ink/40">释义</p>
        <ul class="mt-2 space-y-1.5">
          <li v-for="(m, i) in entry.meanings" :key="i" class="text-sm leading-6">{{ m }}</li>
        </ul>
      </div>

      <!-- 例句 -->
      <div v-if="entry.examples.length" class="mt-5">
        <p class="text-xs font-bold text-ink/40">例句</p>
        <div
          v-for="(ex, i) in entry.examples"
          :key="i"
          class="mt-2 flex items-start justify-between gap-2 rounded-xl bg-paper p-3"
        >
          <div>
            <p class="text-sm font-medium leading-6" lang="en">{{ ex.en }}</p>
            <p v-if="ex.zh" class="text-xs text-ink/50">{{ ex.zh }}</p>
          </div>
          <button class="btn-ghost w-9 shrink-0 justify-center px-2 py-1 text-xs" title="朗读例句" @click="playExample(ex.en)">
            <span v-if="speaking === 'ex'" class="sound-bars" aria-label="正在播放"><i /><i /><i /></span>
            <template v-else>🔊</template>
          </button>
        </div>
      </div>

      <!-- 发音 / 录音 / 回放 -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button class="btn-primary" @click="playWord">
          <span v-if="speaking === 'word'" class="sound-bars" aria-label="正在播放"><i /><i /><i /></span>
          <template v-else>🔊</template>
          {{ speaking === 'word' ? ' 停止' : entry.audio ? ' 播放真人发音' : ' 播放单词发音' }}
        </button>
      </div>
      <div class="mt-4 flex justify-center border-t border-ink/10 pt-4">
        <SpeakScore :key="entry.word" :text="entry.word" />
      </div>

      <!-- 本地命中时：按需展开在线英英释义 -->
      <div v-if="entry.source === 'local'" class="mt-4 text-center">
        <button
          v-if="!apiDetail"
          class="btn-ghost text-xs"
          @click="searchApi(entry.word)"
        >🌐 展开英英释义（在线词典）</button>
        <div v-else-if="!apiDetail.error" class="mt-3 rounded-xl bg-paper p-4 text-left">
          <p class="text-xs font-bold text-ink/40">英英释义（dictionaryapi.dev）</p>
          <ul class="mt-2 space-y-1.5">
            <li v-for="(m, i) in apiDetail.meanings" :key="i" class="text-sm leading-6" lang="en">{{ m }}</li>
          </ul>
        </div>
        <p v-else class="mt-2 text-xs text-ink/40">在线词典暂不可用</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sound-bars {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  height: 13px;
}
.sound-bars i {
  width: 3px;
  border-radius: 1px;
  background: currentColor;
  animation: sound-bar 0.8s ease-in-out infinite;
}
.sound-bars i:nth-child(2) {
  animation-delay: 0.2s;
}
.sound-bars i:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes sound-bar {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 13px;
  }
}
</style>

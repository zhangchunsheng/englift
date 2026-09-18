<script setup>
import { ref, computed, onMounted } from 'vue'
import { markVisit } from '../stores/progress'
import { speak } from '../utils/speech'
import SpeakScore from '../components/SpeakScore.vue'

// 词库元信息（词库本体按需动态加载，避免撑大首屏）
// 数据来源：github.com/kajweb/dict（JSONL），由 scripts/convert-wordbank.py 转换
const bankMeta = [
  { level: 'xiaoxue', label: '小学英语', count: 819 },
  { level: 'chuzhong', label: '初中英语', count: 2289 },
  { level: 'gaozhong', label: '高中英语', count: 3536 },
  { level: 'cet4', label: '英语四级', count: 2607 },
  { level: 'cet6', label: '英语六级', count: 2345 },
  { level: 'kaoyan', label: '考研英语', count: 4533 },
]

const level = ref(bankMeta[0].level)
const bank = ref(null) // 当前词库 { level, label, words }
const word = ref(null) // 当前抽中的单词（onMounted 后才抽，避免 SSR 水合不一致）
const drawnCount = ref(0)
const loading = ref(false)
const bankCache = {}

async function loadBank(lv) {
  if (!bankCache[lv]) {
    loading.value = true
    try {
      bankCache[lv] = (await import(`../data/wordbank/${lv}.json`)).default
    } finally {
      loading.value = false
    }
  }
  bank.value = bankCache[lv]
}

// 随机抽取（避免连续抽到同一个）
function draw() {
  const list = bank.value?.words
  if (!list?.length) return
  let next = list[Math.floor(Math.random() * list.length)]
  if (list.length > 1) {
    while (next.word === word.value?.word) {
      next = list[Math.floor(Math.random() * list.length)]
    }
  }
  word.value = next
  drawnCount.value++
}

async function switchLevel(lv) {
  level.value = lv
  await loadBank(lv)
  draw()
}

onMounted(async () => {
  markVisit('words')
  await loadBank(level.value)
  draw()
})

// 发音播放状态（驱动喇叭动画）：'word' | 'example' | ''
const speaking = ref('')

function playDemo(text, key) {
  if (speaking.value === key) {
    window.speechSynthesis.cancel()
    speaking.value = ''
    return
  }
  const u = speak(text)
  if (!u) return
  u.onstart = () => (speaking.value = key)
  u.onend = u.onerror = () => (speaking.value = '')
}
</script>

<template>
  <div>
    <header class="mb-5">
      <h1 class="font-display text-2xl font-bold text-pine">随机单词</h1>
      <p class="mt-1 text-sm text-ink/60">
        从全量词库里随机抽一个单词：看释义、读例句、听发音，再录下自己的朗读对比。
        六个级别共 {{ bankMeta.reduce((s, b) => s + b.count, 0).toLocaleString() }} 词。
      </p>
    </header>

    <!-- 级别选择 -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        v-for="b in bankMeta"
        :key="b.level"
        class="tag border transition"
        :class="level === b.level ? 'border-pine bg-pine text-paper' : 'border-ink/15 bg-white text-ink/60 hover:border-pine'"
        @click="switchLevel(b.level)"
      >
        {{ b.label }}
        <span class="opacity-60">（{{ b.count.toLocaleString() }}）</span>
      </button>
    </div>

    <p v-if="loading" class="py-16 text-center text-sm text-ink/40">词库加载中…</p>

    <!-- 单词卡片 -->
    <div v-else-if="word" class="card mx-auto max-w-xl p-8 text-center">
      <p class="text-xs tracking-widest text-ink/30">{{ bank.label }} · 第 {{ drawnCount }} 抽</p>
      <p class="font-display mt-3 text-5xl font-bold text-pine" lang="en">{{ word.word }}</p>
      <p v-if="word.phonetic" class="mt-2 font-mono text-lg text-ink/50">{{ word.phonetic }}</p>
      <p class="mt-3 text-base font-medium leading-7">{{ word.meaning }}</p>

      <!-- 例句 -->
      <div v-if="word.example" class="mt-6 rounded-xl bg-paper p-4 text-left">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium leading-7" lang="en">{{ word.example }}</p>
            <p v-if="word.exampleZh" class="text-sm text-ink/50">{{ word.exampleZh }}</p>
          </div>
          <button class="btn-ghost w-10 shrink-0 justify-center" title="朗读例句" @click="playDemo(word.example, 'example')">
            <span v-if="speaking === 'example'" class="sound-bars" aria-label="正在播放"><i /><i /><i /></span>
            <template v-else>🔊</template>
          </button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button class="btn-primary" @click="playDemo(word.word, 'word')">
          <span v-if="speaking === 'word'" class="sound-bars" aria-label="正在播放"><i /><i /><i /></span>
          <template v-else>🔊</template>
          {{ speaking === 'word' ? ' 停止' : ' 播放单词发音' }}
        </button>
        <button class="btn bg-sun text-ink hover:bg-sun/90" @click="draw">🎲 随机抽一个</button>
      </div>

      <!-- 录音 / 回放 / 跟读评分 -->
      <div class="mt-5 border-t border-ink/10 pt-4">
        <p class="mb-2 text-xs text-ink/40">录下自己的朗读，回放对比，或让系统评分：</p>
        <div class="flex justify-center">
          <SpeakScore :key="word.word" :text="word.word" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 发音播放中：喇叭声波柱动画 */
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

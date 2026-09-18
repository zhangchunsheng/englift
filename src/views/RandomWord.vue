<script setup>
import { ref, computed, onMounted } from 'vue'
import { markVisit } from '../stores/progress'
import { speak } from '../utils/speech'
import SpeakScore from '../components/SpeakScore.vue'
import xiaoxue from '../data/wordbank/xiaoxue.json'
import chuzhong from '../data/wordbank/chuzhong.json'
import gaozhong from '../data/wordbank/gaozhong.json'
import cet4 from '../data/wordbank/cet4.json'
import cet6 from '../data/wordbank/cet6.json'
import kaoyan from '../data/wordbank/kaoyan.json'

const banks = [xiaoxue, chuzhong, gaozhong, cet4, cet6, kaoyan]

const level = ref(banks[0].level)
const word = ref(null) // 当前抽中的单词（onMounted 后才抽，避免 SSR 水合不一致）
const drawnCount = ref(0)

const bank = computed(() => banks.find((b) => b.level === level.value))

// 随机抽取（避免连续抽到同一个）
function draw() {
  const list = bank.value.words
  let next = list[Math.floor(Math.random() * list.length)]
  if (list.length > 1) {
    while (next.word === word.value?.word) {
      next = list[Math.floor(Math.random() * list.length)]
    }
  }
  word.value = next
  drawnCount.value++
}

function switchLevel(lv) {
  level.value = lv
  draw()
}

onMounted(() => {
  markVisit('words')
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
        从词库里随机抽一个单词：看释义、读例句、听发音，再录下自己的朗读对比。词库按级别分类，持续扩充。
      </p>
    </header>

    <!-- 级别选择 -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        v-for="b in banks"
        :key="b.level"
        class="tag border transition"
        :class="level === b.level ? 'border-pine bg-pine text-paper' : 'border-ink/15 bg-white text-ink/60 hover:border-pine'"
        @click="switchLevel(b.level)"
      >
        {{ b.label }}
        <span class="opacity-60">（{{ b.words.length }}）</span>
      </button>
    </div>

    <!-- 单词卡片 -->
    <div v-if="word" class="card mx-auto max-w-xl p-8 text-center">
      <p class="text-xs tracking-widest text-ink/30">{{ bank.label }} · 第 {{ drawnCount }} 抽</p>
      <p class="font-display mt-3 text-5xl font-bold text-pine" lang="en">{{ word.word }}</p>
      <p class="mt-2 font-mono text-lg text-ink/50">{{ word.phonetic }}</p>
      <p class="mt-3 text-lg">
        <span class="tag bg-pine/10 text-pine">{{ word.pos }}</span>
        <span class="ml-2 font-medium">{{ word.meaning }}</span>
      </p>

      <!-- 例句 -->
      <div class="mt-6 rounded-xl bg-paper p-4 text-left">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium leading-7" lang="en">{{ word.example }}</p>
            <p class="text-sm text-ink/50">{{ word.exampleZh }}</p>
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

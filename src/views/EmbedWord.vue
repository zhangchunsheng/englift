<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { speak } from '../utils/speech'

// 嵌入式随机单词卡片（供 iframe 使用）
// 参数：?level=xiaoxue|chuzhong|gaozhong|cet4|cet6|kaoyan（缺省随机一个级别）
const route = useRoute()
const LEVELS = ['xiaoxue', 'chuzhong', 'gaozhong', 'cet4', 'cet6', 'kaoyan']
const level = computed(() => {
  const lv = String(route.query.level || '')
  return LEVELS.includes(lv) ? lv : LEVELS[Math.floor(Math.random() * LEVELS.length)]
})

const bank = ref(null)
const word = ref(null)

async function load() {
  bank.value = (await import(`../data/wordbank/${level.value}.json`)).default
  draw()
}

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
}

onMounted(load)

// 发音播放（带喇叭动画）
const speaking = ref(false)
function play(text) {
  if (speaking.value) {
    window.speechSynthesis.cancel()
    speaking.value = false
    return
  }
  const u = speak(text)
  if (!u) return
  u.onstart = () => (speaking.value = true)
  u.onend = u.onerror = () => (speaking.value = false)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-transparent p-3">
    <div v-if="word" class="card w-full max-w-sm p-5 text-center">
      <p class="text-[10px] tracking-widest text-ink/30">{{ bank.label }} · 每日一词</p>
      <p class="font-display mt-2 text-3xl font-bold text-pine" lang="en">{{ word.word }}</p>
      <p v-if="word.phonetic" class="mt-1 font-mono text-sm text-ink/50">{{ word.phonetic }}</p>
      <p class="mt-2 text-sm font-medium leading-6">{{ word.meaning }}</p>

      <div v-if="word.example" class="mt-3 rounded-xl bg-paper p-3 text-left">
        <p class="text-sm leading-6" lang="en">{{ word.example }}</p>
        <p v-if="word.exampleZh" class="mt-0.5 text-xs text-ink/50">{{ word.exampleZh }}</p>
      </div>

      <div class="mt-4 flex items-center justify-center gap-2">
        <button class="btn-primary px-4 py-1.5 text-xs" @click="play(word.word)">
          <span v-if="speaking" class="sound-bars" aria-label="正在播放"><i /><i /><i /></span>
          <template v-else>🔊</template>
          {{ speaking ? ' 停止' : ' 播放发音' }}
        </button>
        <button v-if="word.example" class="btn-ghost px-3 py-1.5 text-xs" title="朗读例句" @click="play(word.example)">
          🔊 例句
        </button>
        <button class="btn-ghost px-3 py-1.5 text-xs" @click="draw">🎲 换一个</button>
      </div>

      <a
        href="https://englift.luomor.com/"
        target="_blank"
        rel="noopener"
        class="mt-3 block text-[10px] text-ink/30 hover:text-pine"
      >Powered by EngLift · 英语学习实验室</a>
    </div>
  </div>
</template>

<style scoped>
.sound-bars {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  height: 12px;
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
    height: 12px;
  }
}
</style>

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
  stopPlaybackCleanup()
}

function switchLevel(lv) {
  level.value = lv
  draw()
}

onMounted(() => {
  markVisit('words')
  draw()
})

// ===== 录音 / 回放（独立于语音识别，纯 MediaRecorder） =====
const recording = ref(false)
const audioUrl = ref('')
const recordError = ref('')
let recorder = null
let stream = null
let chunks = []

function stopPlaybackCleanup() {
  if (recorder && recorder.state !== 'inactive') recorder.stop()
  recording.value = false
  audioUrl.value = ''
  recordError.value = ''
}

async function toggleRecord() {
  if (recording.value) {
    recorder?.stop() // onstop 里收尾
    return
  }
  recordError.value = ''
  audioUrl.value = ''
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) =>
      window.MediaRecorder?.isTypeSupported?.(t)
    )
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    recorder.onstop = () => {
      audioUrl.value = URL.createObjectURL(
        new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      )
      stream?.getTracks().forEach((t) => t.stop())
      stream = null
      recording.value = false
    }
    recorder.start()
    recording.value = true
  } catch (e) {
    recordError.value =
      e.name === 'NotAllowedError'
        ? '麦克风权限被拒绝：点击地址栏 🔒 → 网站设置 → 麦克风 → 允许'
        : '无法录音：' + (e.message || e.name)
  }
}

function playRecording() {
  if (audioUrl.value) new Audio(audioUrl.value).play()
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
          <button class="btn-ghost shrink-0" title="朗读例句" @click="speak(word.example)">🔊</button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button class="btn-primary" @click="speak(word.word)">🔊 播放单词发音</button>
        <button
          class="btn"
          :class="recording ? 'bg-clay text-paper' : 'border border-ink/15 bg-white text-ink/70 hover:border-clay hover:text-clay'"
          @click="toggleRecord"
        >
          <span v-if="recording" class="relative flex h-2.5 w-2.5">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          {{ recording ? '⏹ 停止录音' : '🎤 录音' }}
        </button>
        <button v-if="audioUrl" class="btn-ghost" @click="playRecording">▶ 回放我的录音</button>
        <button class="btn bg-sun text-ink hover:bg-sun/90" @click="draw">🎲 随机抽一个</button>
      </div>

      <p v-if="recording" class="mt-3 text-xs text-clay">录音中…读完单词后点「停止录音」</p>
      <p v-if="recordError" class="mt-3 rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">{{ recordError }}</p>

      <!-- 跟读评分（可选） -->
      <div class="mt-5 border-t border-ink/10 pt-4">
        <p class="mb-2 text-xs text-ink/40">想知道自己读得准不准？</p>
        <div class="flex justify-center">
          <SpeakScore :key="word.word" :text="word.word" />
        </div>
      </div>
    </div>
  </div>
</template>

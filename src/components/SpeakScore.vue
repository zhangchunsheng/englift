<script setup>
import { ref, computed } from 'vue'
import {
  isRecognitionSupported,
  recognizeOnce,
  scoreAttempt,
  scoreFeedback,
  mapSpeechError,
} from '../utils/speechScore'
import { speak } from '../utils/speech'

const props = defineProps({
  text: { type: String, required: true }, // 要跟读的英文
  compact: { type: Boolean, default: false }, // 紧凑模式（只显示 mic 按钮，结果浮现在下方）
})

const supported = isRecognitionSupported()
const listening = ref(false)
const result = ref(null)
const error = ref('')
let session = null

const feedback = computed(() => (result.value ? scoreFeedback(result.value.score) : null))

async function start() {
  if (listening.value) {
    session?.stop()
    return
  }
  error.value = ''
  result.value = null
  listening.value = true
  try {
    session = recognizeOnce({ lang: 'en-US' })
    const transcript = await session.promise
    result.value = { ...scoreAttempt(props.text, transcript), transcript }
  } catch (e) {
    error.value = mapSpeechError(e.message)
  } finally {
    listening.value = false
    session = null
  }
}
</script>

<template>
  <div v-if="supported" class="speak-score" :class="{ compact }">
    <div class="flex items-center gap-2">
      <button
        class="btn text-xs"
        :class="listening ? 'bg-clay text-paper' : 'bg-pine/10 text-pine hover:bg-pine/20'"
        @click="start"
      >
        <span v-if="listening" class="relative flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        {{ listening ? '聆听中…点击结束' : '🎤 跟读评分' }}
      </button>
      <button class="btn-ghost px-2.5 py-1.5 text-xs" title="听示范发音" @click="speak(text)">🔊</button>
    </div>

    <p v-if="error" class="mt-2 rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">{{ error }}</p>

    <!-- 评分结果 -->
    <div v-if="result" class="mt-3 rounded-xl border border-ink/10 bg-white p-3">
      <div class="flex items-center gap-3">
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
          :style="{ backgroundColor: feedback.color }"
        >{{ result.score }}</span>
        <div class="text-sm">
          <p class="font-medium">{{ feedback.emoji }} {{ feedback.label }}</p>
          <p class="mt-0.5 text-xs text-ink/40">
            读对 {{ result.correct }}/{{ result.total }} 个词 · 识别结果：<span lang="en" class="font-mono">{{ result.transcript || '（空）' }}</span>
          </p>
        </div>
      </div>
      <!-- 逐词反馈 -->
      <p class="mt-3 leading-8" lang="en">        <span
          v-for="(w, i) in result.words"
          :key="i"
          class="mr-1.5 rounded px-1 py-0.5"
          :class="{
            'bg-moss/15 text-moss': w.status === 'correct',
            'bg-sun/15 text-[#b07c22]': w.status === 'close',
            'bg-clay/15 text-clay underline decoration-clay/50 underline-offset-2': w.status === 'wrong',
            'bg-ink/5 text-ink/30 line-through': w.status === 'missing',
          }"
          :title="w.status === 'wrong' ? `识别为「${w.heard}」` : w.status === 'close' ? `接近：识别为「${w.heard}」，注意词尾` : w.status === 'missing' ? '漏读' : ''"
        >{{ w.word }}</span>
      </p>
      <p class="mt-1 flex gap-3 text-[10px] text-ink/40">
        <span><i class="mr-0.5 inline-block h-2 w-2 rounded-sm bg-moss/40" />读对</span>
        <span><i class="mr-0.5 inline-block h-2 w-2 rounded-sm bg-sun/40" />接近（注意词尾）</span>
        <span><i class="mr-0.5 inline-block h-2 w-2 rounded-sm bg-clay/40" />读错</span>
        <span><i class="mr-0.5 inline-block h-2 w-2 rounded-sm bg-ink/20" />漏读</span>
      </p>
    </div>
  </div>

  <!-- 不支持的浏览器：提示但不阻塞 -->
  <p v-else-if="!compact" class="text-xs text-ink/30">
    🎤 当前浏览器不支持发音评分，推荐 Chrome / Edge
  </p>
</template>

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
const showMicGuide = ref(false) // 麦克风开启指引
const insecure = typeof window !== 'undefined' && !window.isSecureContext
let session = null

const feedback = computed(() => (result.value ? scoreFeedback(result.value.score) : null))

/**
 * 先申请麦克风权限：
 * 1. getUserMedia 会可靠地弹出授权框（拿到流立即关闭，只用它的权限）
 * 2. 已被永久拒绝时不会弹窗 —— 此时展示手动开启指引
 * 返回 true 表示可用
 */
async function ensureMicPermission() {
  if (insecure) {
    error.value = '当前页面不是 HTTPS，浏览器禁用了麦克风。请通过 https:// 访问本站'
    return false
  }
  // 预检：已永久拒绝则直接给指引（再调用也不会弹窗）
  try {
    const status = await navigator.permissions.query({ name: 'microphone' })
    if (status.state === 'denied') {
      showMicGuide.value = true
      return false
    }
  } catch {
    // 部分浏览器不支持查询 microphone 权限，忽略继续尝试
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop()) // 只要权限，立即释放
    showMicGuide.value = false
    return true
  } catch (e) {
    if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
      // 用户点了拒绝，或之前已拒绝 —— 展示手动指引
      showMicGuide.value = true
    } else if (e.name === 'NotFoundError') {
      error.value = '找不到麦克风设备，请检查麦克风连接'
    } else {
      error.value = '无法访问麦克风：' + e.message
    }
    return false
  }
}

async function start() {
  if (listening.value) {
    session?.stop()
    return
  }
  error.value = ''
  result.value = null
  if (!(await ensureMicPermission())) return
  listening.value = true
  try {
    session = recognizeOnce({ lang: 'en-US' })
    const transcript = await session.promise
    result.value = { ...scoreAttempt(props.text, transcript), transcript }
  } catch (e) {
    if (e.message === 'not-allowed' || e.message === 'service-not-allowed') {
      showMicGuide.value = true
    } else {
      error.value = mapSpeechError(e.message)
    }
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

    <!-- 麦克风开启指引 -->
    <div v-if="showMicGuide" class="mt-2 rounded-xl border border-sun/40 bg-sun/10 p-3 text-xs leading-6 text-ink/70">
      <p class="font-bold text-ink">🎙️ 需要允许麦克风权限才能评分：</p>
      <ol class="mt-1 list-inside list-decimal space-y-0.5">
        <li>点击浏览器地址栏左侧的 <b>🔒 锁形 / 设置图标</b></li>
        <li>找到「<b>麦克风</b>」，切换为「<b>允许</b>」</li>
        <li>刷新本页面后重新点击「🎤 跟读评分」</li>
      </ol>
      <p class="mt-1 text-ink/40">手机端：浏览器菜单 → 设置 → 网站设置 → 麦克风 → 允许本站。</p>
      <button class="btn-ghost mt-2 px-2.5 py-1 text-xs" @click="start">我已开启，重试</button>
    </div>

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
      <p class="mt-3 leading-8" lang="en">
        <span
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

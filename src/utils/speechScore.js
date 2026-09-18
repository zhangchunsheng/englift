// 发音评分：浏览器 SpeechRecognition 识别 + 词级对齐评分
// 注意：Chrome/Edge 支持（需联网），Firefox 不支持 —— 调用方需先检查 isRecognitionSupported()

export function isRecognitionSupported() {
  return (
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  )
}

/**
 * 启动一次语音识别，返回 { promise, stop }
 * promise resolve 为 { text, audioUrl }：识别文本 + 用户录音（Blob URL，可回放）
 * reject 的 Error 上同样可能挂有 audioUrl（如 no-speech 时也可回放自查）
 *
 * 内置 VAD（音量监测）：
 * - 检测到说话后，静音 silenceMs 自动结束（无需手动点停）
 * - 一直没人说话 noSpeechMs 自动结束并报 no-speech
 * - 最长 maxMs 强制结束
 * - onUpdate 回调实时文本（含临时结果）
 */
export function recognizeOnce({
  lang = 'en-US',
  silenceMs = 1500,
  noSpeechMs = 6000,
  maxMs = 15000,
  onUpdate,
} = {}) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return { promise: Promise.reject(new Error('unsupported')), stop() {} }

  const rec = new SR()
  rec.lang = lang
  rec.interimResults = true
  rec.continuous = true
  rec.maxAlternatives = 1

  let finalText = ''
  let interimText = ''
  let settled = false
  let heardSpeech = false
  let lastSpeechAt = 0
  let audioCtx = null
  let stream = null
  let recorder = null
  let chunks = []
  let audioUrl = null
  let rafId = 0
  const startedAt = Date.now()

  const currentText = () => (finalText + ' ' + interimText).trim()
  const emit = () => onUpdate?.(currentText())

  let resolvePromise, rejectPromise
  const promise = new Promise((res, rej) => {
    resolvePromise = res
    rejectPromise = rej
  })

  function buildAudio() {
    if (!audioUrl && chunks.length) {
      const type = recorder?.mimeType || 'audio/webm'
      audioUrl = URL.createObjectURL(new Blob(chunks, { type }))
    }
    return audioUrl
  }

  function finish(err) {
    if (settled) return
    settled = true
    cancelAnimationFrame(rafId)
    try {
      rec.onresult = rec.onerror = rec.onend = null
      rec.stop()
    } catch {
      /* 忽略 */
    }
    // 先等 MediaRecorder 把最后的数据吐出来（onstop 异步），再汇总结果
    const complete = () => {
      try {
        audioCtx?.close()
      } catch {
        /* 忽略 */
      }
      stream?.getTracks().forEach((t) => t.stop())
      stream = null
      const text = currentText()
      const audio = buildAudio()
      if (text) resolvePromise({ text, audioUrl: audio })
      else {
        const e = err || new Error('no-speech')
        e.audioUrl = audio
        rejectPromise(e)
      }
    }
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = complete
      try {
        recorder.stop()
      } catch {
        complete()
      }
    } else {
      complete()
    }
  }

  rec.onresult = (e) => {
    interimText = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' '
      else interimText += e.results[i][0].transcript
    }
    heardSpeech = true
    lastSpeechAt = Date.now()
    emit()
  }
  rec.onerror = (e) => finish(new Error(e.error || 'unknown'))
  rec.onend = () => {
    if (!settled) finish(currentText() ? null : new Error('no-speech'))
  }

  // 录音 + 音量监测：RMS 超过阈值视为说话，说完后静音自动结束
  async function startAudio() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // 全程录音，供用户回放
      try {
        const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) =>
          window.MediaRecorder?.isTypeSupported?.(t)
        )
        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
        recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
        recorder.start(250)
      } catch {
        recorder = null
      }

      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      // 浏览器自动播放策略：AudioContext 可能处于 suspended，必须显式 resume
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume()
        } catch {
          /* 忽略 */
        }
      }
      const src = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      src.connect(analyser)
      const buf = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        if (settled) return
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / buf.length)
        const now = Date.now()
        if (rms > 0.012) {
          heardSpeech = true
          lastSpeechAt = now
        }
        if (heardSpeech && now - lastSpeechAt > silenceMs) return finish(null)
        if (!heardSpeech && now - startedAt > noSpeechMs) return finish(new Error('no-speech'))
        if (now - startedAt > maxMs) return finish(null)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    } catch {
      // 音频通道不可用时退化为固定时长
      setTimeout(() => finish(null), maxMs)
    }
  }

  rec.start()
  startAudio()

  return { promise, stop: () => finish(null) }
}

// 分词：小写、去标点（保留撇号），按空格切
function tokenize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

// 字符级编辑距离（用于判定"接近"：如 book → books）
function charDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => {
    const row = Array(b.length + 1).fill(0)
    row[0] = i
    return row
  })
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return dp[a.length][b.length]
}

/** 两个词是否"接近"：长度 ≥3 且编辑距离 ≤1（容忍漏读/多读词尾 -s、-ed 等） */
function isClose(a, b) {
  return a !== b && Math.min(a.length, b.length) >= 3 && charDistance(a, b) <= 1
}

/**
 * 词级对齐评分（Levenshtein 回溯）
 * 返回 { words: [{word, status, heard?}], score, correct, total }
 * status: correct 读对 | close 接近（半分） | wrong 读成了别的词 | missing 漏读
 */
export function scoreAttempt(expected, actual) {
  const exp = tokenize(expected)
  const act = tokenize(actual)
  const m = exp.length
  const n = act.length

  const dp = Array.from({ length: m + 1 }, (_, i) => {
    const row = Array(n + 1).fill(0)
    row[0] = i
    return row
  })
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = exp[i - 1] === act[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }

  // 回溯对齐路径
  const words = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && exp[i - 1] === act[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      words.unshift({ word: exp[i - 1], status: 'correct' })
      i--
      j--
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      const close = isClose(exp[i - 1], act[j - 1])
      words.unshift({ word: exp[i - 1], status: close ? 'close' : 'wrong', heard: act[j - 1] })
      i--
      j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      words.unshift({ word: exp[i - 1], status: 'missing' })
      i--
    } else {
      j-- // 多读出来的词，忽略
    }
  }

  // correct 计 1 分，close 计 0.5 分
  const points = words.reduce((s, w) => s + (w.status === 'correct' ? 1 : w.status === 'close' ? 0.5 : 0), 0)
  const correct = words.filter((w) => w.status === 'correct').length
  const score = m === 0 ? 0 : Math.round((points / m) * 100)
  return { words, score, correct, total: m }
}

export function scoreFeedback(score) {
  if (score >= 90) return { label: '优秀！发音很标准', emoji: '🌟', color: '#2f5233' }
  if (score >= 70) return { label: '不错，注意标红的词', emoji: '💪', color: '#3d6ec6' }
  if (score >= 40) return { label: '继续加油，先听一遍再跟读', emoji: '📖', color: '#e8a33d' }
  return { label: '别灰心，点 🔊 多听几遍再试', emoji: '🌱', color: '#c65f3d' }
}

export function mapSpeechError(code) {
  const map = {
    'not-allowed': '麦克风权限被拒绝，请点击地址栏左侧图标允许麦克风',
    'service-not-allowed': '麦克风权限被拒绝，请检查浏览器设置',
    'no-speech': '没听到声音，请靠近麦克风大声一点再试',
    timeout: '等待超时，请再试一次',
    network: '语音识别服务需要联网，请检查网络',
    unsupported: '当前浏览器不支持语音识别，推荐用 Chrome / Edge',
    'audio-capture': '找不到麦克风设备',
    aborted: '已取消',
  }
  return map[code] || `识别出错（${code}），请再试一次`
}

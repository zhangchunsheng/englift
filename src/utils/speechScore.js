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
 * promise resolve 为识别文本；stop() 可提前结束并取回已有结果
 */
export function recognizeOnce({ lang = 'en-US', timeout = 10000 } = {}) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return { promise: Promise.reject(new Error('unsupported')), stop() {} }

  const rec = new SR()
  rec.lang = lang
  rec.interimResults = false
  rec.maxAlternatives = 1

  let settled = false
  const promise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        rec.abort()
        reject(new Error('timeout'))
      }
    }, timeout)

    rec.onresult = (e) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(e.results[0][0].transcript || '')
    }
    rec.onerror = (e) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(new Error(e.error || 'unknown'))
    }
    rec.onend = () => {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        reject(new Error('no-speech'))
      }
    }
  })

  rec.start()
  return { promise, stop: () => rec.stop() }
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

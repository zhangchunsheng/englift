<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { quizTopics, questions } from '../data/quizzes'
import { recordQuiz, markVisit } from '../stores/progress'

const route = useRoute()
const router = useRouter()

const topic = computed(() => route.params.topic || '')
const topicInfo = computed(() => quizTopics.find((t) => t.key === topic.value))
const questionList = computed(() => questions[topic.value] || [])

const phase = ref('pick') // pick | doing | result
const idx = ref(0)
const answers = ref([])
const current = ref('')
const result = ref(null)

// 排序题状态
const picked = ref([])
const pool = ref([])

onMounted(() => {
  markVisit('quiz')
  if (topicInfo.value) start()
})

watch(topic, () => {
  if (topicInfo.value) start()
  else phase.value = 'pick'
})

function start() {
  phase.value = 'doing'
  idx.value = 0
  answers.value = []
  result.value = null
  setupQuestion()
}

function setupQuestion() {
  const q = questionList.value[idx.value]
  current.value = ''
  picked.value = []
  pool.value = q.type === 'order' ? shuffle([...q.words]) : []
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const canSubmit = computed(() => {
  const q = questionList.value[idx.value]
  if (!q) return false
  if (q.type === 'order') return picked.value.length === q.words.length
  return current.value.trim().length > 0
})

function submit() {
  const q = questionList.value[idx.value]
  answers.value[idx.value] = q.type === 'order' ? picked.value.join(' ') : current.value.trim()
  if (idx.value + 1 < questionList.value.length) {
    idx.value++
    setupQuestion()
  } else {
    finish()
  }
}

function finish() {
  // 判分：大小写与多余空格不敏感
  const normalized = questionList.value.map((q, i) => norm(answers.value[i]))
  const qs = questionList.value.map((q) => ({ ...q, answer: norm(q.answer) }))
  const res = recordQuiz(topicInfo.value.label, qs, normalized)
  result.value = res
  phase.value = 'result'
}

const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim()

function pickWord(w, i) {
  picked.value.push(w)
  pool.value.splice(i, 1)
}
function unpickWord(w, i) {
  pool.value.push(w)
  picked.value.splice(i, 1)
}
</script>

<template>
  <div>
    <!-- 选题页 -->
    <template v-if="phase === 'pick'">
      <header class="mb-5">
        <h1 class="font-display text-2xl font-bold text-pine">配套练习</h1>
        <p class="mt-1 text-sm text-ink/60">选择、填空、排序三种题型。做错的题自动进入错题本。</p>
      </header>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="t in quizTopics"
          :key="t.key"
          :to="`/quiz/${t.key}`"
          class="card p-5 transition hover:-translate-y-1 hover:border-pine/40 hover:shadow-lg"
        >
          <h2 class="font-bold">{{ t.label }}</h2>
          <p class="mt-1 text-sm text-ink/50">{{ t.desc }}</p>
          <p class="mt-3 text-xs text-pine">{{ questions[t.key].length }} 道题 →</p>
        </RouterLink>
      </div>
    </template>

    <!-- 答题页 -->
    <template v-else-if="phase === 'doing' && questionList.length">
      <div class="mb-4 flex items-center justify-between text-sm text-ink/50">
        <span>{{ topicInfo.label }} · 第 {{ idx + 1 }} / {{ questionList.length }} 题</span>
        <span class="tag bg-pine/10 text-pine">
          {{ { choice: '选择题', blank: '填空题', order: '排序题' }[questionList[idx].type] }}
        </span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div class="h-full rounded-full bg-pine transition-all" :style="{ width: `${(idx / questionList.length) * 100}%` }" />
      </div>

      <div class="card mt-5 p-6">
        <p class="text-lg font-medium leading-8" lang="en">{{ questionList[idx].prompt }}</p>
        <p v-if="questionList[idx].hint" class="mt-1 text-xs text-ink/40">💡 {{ questionList[idx].hint }}</p>

        <!-- 选择题 -->
        <div v-if="questionList[idx].type === 'choice'" class="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            v-for="opt in questionList[idx].options"
            :key="opt"
            class="rounded-xl border px-4 py-3 text-left text-sm transition"
            :class="current === opt ? 'border-pine bg-pine/10 ring-1 ring-pine' : 'border-ink/15 bg-white hover:border-pine/50'"
            lang="en"
            @click="current = opt"
          >{{ opt }}</button>
        </div>

        <!-- 填空题 -->
        <div v-else-if="questionList[idx].type === 'blank'" class="mt-5">
          <input
            v-model="current"
            type="text"
            placeholder="输入答案，回车提交…"
            class="w-full max-w-md rounded-xl border border-ink/15 bg-white px-4 py-2.5 font-mono outline-none focus:border-pine"
            lang="en"
            @keyup.enter="canSubmit && submit()"
          />
        </div>

        <!-- 排序题 -->
        <div v-else class="mt-5 space-y-4">
          <div class="min-h-14 rounded-xl border-2 border-dashed border-ink/20 bg-paper p-3">
            <p v-if="!picked.length" class="text-sm text-ink/30">点击下方词块，按正确顺序排列…</p>
            <button
              v-for="(w, i) in picked"
              :key="i"
              class="tag mr-2 bg-pine text-paper"
              lang="en"
              @click="unpickWord(w, i)"
            >{{ w }} ✕</button>
          </div>
          <div>
            <button
              v-for="(w, i) in pool"
              :key="i"
              class="tag mr-2 border border-ink/20 bg-white hover:border-pine"
              lang="en"
              @click="pickWord(w, i)"
            >{{ w }}</button>
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <button class="btn-ghost" @click="router.push('/quiz')">退出</button>
          <button class="btn-primary" :disabled="!canSubmit" :class="{ 'opacity-40': !canSubmit }" @click="submit">
            {{ idx + 1 === questionList.length ? '提交并判分' : '下一题 →' }}
          </button>
        </div>
      </div>
    </template>

    <!-- 结果页 -->
    <template v-else-if="result">
      <div class="card mx-auto max-w-lg p-8 text-center">
        <p class="text-5xl">{{ result.correct === result.total ? '🎉' : result.correct >= result.total * 0.6 ? '💪' : '📖' }}</p>
        <h2 class="font-display mt-4 text-3xl font-bold text-pine">
          {{ result.correct }} / {{ result.total }}
        </h2>
        <p class="mt-2 text-sm text-ink/60">
          <template v-if="result.correct === result.total">全部正确，太棒了！</template>
          <template v-else>错了 {{ result.total - result.correct }} 题，已收入错题本，记得复习。</template>
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button class="btn-primary" @click="start">再做一遍</button>
          <RouterLink v-if="result.correct < result.total" to="/mistakes" class="btn bg-clay text-paper hover:bg-clay/90">去复习错题</RouterLink>
          <RouterLink to="/quiz" class="btn-ghost">换个专项</RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>

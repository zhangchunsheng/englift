import { reactive, watch } from 'vue'

const STORAGE_KEY = 'englift-progress-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

/**
 * 学习进度与错题本（localStorage 持久化）
 * visits:   { [routeName]: count }
 * mistakes: [{ id, topic, prompt, answer, chosen, ts }]
 * quizStats:{ [topic]: { done, correct } }
 */
export const progress = reactive({
  visits: {},
  mistakes: [],
  quizStats: {},
  ...load(),
})

watch(
  progress,
  (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
  { deep: true }
)

export function markVisit(name) {
  progress.visits[name] = (progress.visits[name] || 0) + 1
}

export function recordQuiz(topic, questions, answers) {
  const correct = questions.filter((q, i) => answers[i] === q.answer).length
  const stat = progress.quizStats[topic] || { done: 0, correct: 0 }
  stat.done += questions.length
  stat.correct += correct
  progress.quizStats[topic] = stat

  questions.forEach((q, i) => {
    if (answers[i] !== q.answer) {
      // 同题已在错题本则更新，否则追加；上限 100 条
      const idx = progress.mistakes.findIndex((m) => m.id === q.id)
      const entry = {
        id: q.id,
        topic,
        prompt: q.prompt,
        hint: q.hint || '',
        answer: q.answer,
        chosen: answers[i],
        options: q.options || null,
        ts: Date.now(),
      }
      if (idx >= 0) progress.mistakes.splice(idx, 1, entry)
      else progress.mistakes.unshift(entry)
    }
  })
  if (progress.mistakes.length > 100) progress.mistakes.length = 100
  return { total: questions.length, correct }
}

export function removeMistake(id) {
  const idx = progress.mistakes.findIndex((m) => m.id === id)
  if (idx >= 0) progress.mistakes.splice(idx, 1)
}

export function clearMistakes() {
  progress.mistakes = []
}

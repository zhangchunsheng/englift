import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '学习目录' } },
  { path: '/tenses', name: 'tenses', component: () => import('../views/TenseTimeline.vue'), meta: { title: '时态时间线' } },
  { path: '/verbs', name: 'verbs', component: () => import('../views/VerbForms.vue'), meta: { title: '词形变化' } },
  { path: '/prepositions', name: 'prepositions', component: () => import('../views/PrepMap.vue'), meta: { title: '介词街区地图' } },
  { path: '/phonemes', name: 'phonemes', component: () => import('../views/PhonemeChart.vue'), meta: { title: '音标图谱' } },
  { path: '/sentences', name: 'sentences', component: () => import('../views/SentenceLab.vue'), meta: { title: '句子拆解' } },
  { path: '/quiz/:topic?', name: 'quiz', component: () => import('../views/QuizView.vue'), meta: { title: '配套练习' } },
  { path: '/mistakes', name: 'mistakes', component: () => import('../views/MistakesView.vue'), meta: { title: '错题复习' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title || ''} · EngLift 英语实验室`
})

export default router

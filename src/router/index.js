import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/', name: 'home', component: () => import('../views/HomeView.vue'),
    meta: { title: '学习目录', description: 'EngLift 英语可视化学习实验室：用时间线学时态、地图学介词、图谱学音标、拆解学句子，配双语例句与配套练习。' },
  },
  {
    path: '/tenses', name: 'tenses', component: () => import('../views/TenseTimeline.vue'),
    meta: { title: '时态时间线', description: '把 12 个英语时态钉在同一条时间线上：一般过去时、现在进行时、现在完成时、将来完成时……点与区间可视化，配结构公式、标志词与双语例句。' },
  },
  {
    path: '/verbs', name: 'verbs', component: () => import('../views/VerbForms.vue'),
    meta: { title: '词形变化', description: '初中常见不规则动词全表：按 AAA/ABB/ABA/ABC 变化规律分组，支持原形/过去式/过去分词/中文检索与翻卡记忆，配双语例句。' },
  },
  {
    path: '/prepositions', name: 'prepositions', component: () => import('../views/PrepMap.vue'),
    meta: { title: '介词街区地图', description: '在街区地图上学习英语方位与移动介词：in/on/behind/opposite/across/through，含 across vs through vs over 易混辨析与双语例句。' },
  },
  {
    path: '/phonemes', name: 'phonemes', component: () => import('../views/PhonemeChart.vue'),
    meta: { title: '音标图谱', description: '48 个国际音标点读发音：单元音、双元音、清浊成对的辅音，附口型提示与 sheep/ship 等易混音对比。' },
  },
  {
    path: '/sentences', name: 'sentences', component: () => import('../views/SentenceLab.vue'),
    meta: { title: '句子拆解', description: '英语五大基本句型逐块拆解：主谓、主谓宾、主系表、双宾语、宾语补足语，点击词块查看句子成分与划分依据。' },
  },
  {
    path: '/words', name: 'words', component: () => import('../views/RandomWord.vue'),
    meta: { title: '随机单词', description: '全量词库随机抽词：小学/初中/高中/四级/六级/考研共 16129 词，含音标、释义、双语例句、发音播放、录音回放与跟读评分。' },
  },
  {
    path: '/dict', name: 'dict', component: () => import('../views/DictView.vue'),
    meta: { title: '英语词典', description: '英语单词查询：本地 8174 词离线秒查（小学到考研六级词库去重合并），在线词典兜底提供真人发音与英英释义，支持录音回放与跟读评分。' },
  },
  {
    path: '/quiz/:topic?', name: 'quiz', component: () => import('../views/QuizView.vue'),
    meta: { title: '配套练习', description: '英语配套练习：时态、词形、介词、音标、句法五个专项，选择/填空/排序题型，自动判分并收入错题本。' },
  },
  {
    path: '/mistakes', name: 'mistakes', component: () => import('../views/MistakesView.vue'),
    meta: { title: '错题复习', description: '英语错题本：做错的题自动收录，按专项筛选复习，掌握后手动移除。' },
  },
]

export function createAppRouter(history) {
  const router = createRouter({
    history: history || createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({ top: 0 }),
  })

  router.afterEach((to) => {
    // SSR 环境没有 document，跳过
    if (typeof document === 'undefined') return
    document.title = `${to.meta.title || ''} · EngLift 英语实验室`
    const desc = to.meta.description
    if (desc) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', desc)
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc)
    }
  })

  return router
}

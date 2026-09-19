<script setup>
import { RouterLink } from 'vue-router'
import { progress } from '../stores/progress'
import { quizTopics } from '../data/quizzes'

const modules = [
  {
    to: '/tenses', icon: '🕰️', title: '时态时间线', en: 'Tense Timeline',
    desc: '把 12 个时态钉在同一条时间线上：点、线段与区域，一眼看清动作和时间的关系。',
    tags: ['交互演示', '双语例句', '跟读评分'],
  },
  {
    to: '/verbs', icon: '🔀', title: '词形变化', en: 'Verb Forms',
    desc: '初中常见不规则动词全表，按 AAA / ABB / ABA / ABC 规律分组，支持检索与翻卡记忆。',
    tags: ['规律分组', '翻卡练习'],
  },
  {
    to: '/prepositions', icon: '🗺️', title: '介词街区地图', en: 'Preposition Map',
    desc: '在街区地图上标注方位与移动介词：in / on / across / through… 跟着你的视角变。',
    tags: ['图解讲解', '对比辨析'],
  },
  {
    to: '/phonemes', icon: '🔊', title: '音标图谱', en: 'Phoneme Chart',
    desc: '48 个国际音标点读发音，清浊成对排列，附易混音对比和口型提示。',
    tags: ['点读发音', '易混音对比', '发音评分'],
  },
  {
    to: '/sentences', icon: '🧩', title: '句子拆解', en: 'Sentence Lab',
    desc: '五大基本句型逐块拆解，点击词块看它扮演什么成分、为什么这样分。',
    tags: ['五大句型', '点击词块'],
  },
  {
    to: '/words', icon: '🎲', title: '随机单词', en: 'Random Word',
    desc: '全量词库随机抽词：小学到考研六个级别共 16,129 词，音标释义、双语例句、发音播放、录音回放、跟读评分。',
    tags: ['16129 词', '录音对比', '跟读评分'],
  },
  {
    to: '/dict', icon: '📖', title: '英语词典', en: 'Dictionary',
    desc: '输入单词即查：本地 8,174 词离线秒查，在线词典兜底真人发音与英英释义，标注所属词库级别。',
    tags: ['离线秒查', '真人发音', '跟读评分'],
  },
  {
    to: '/quiz', icon: '✏️', title: '配套练习', en: 'Practice',
    desc: '选择、填空、排序三种题型，接入错题本自动复习。',
    tags: ['自动判分', '错题复习'],
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-3xl bg-pine px-6 py-12 text-paper sm:px-10">
      <div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-leaf/20 blur-2xl" />
      <div class="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sun/20 blur-2xl" />
      <p class="text-xs tracking-[0.3em] text-leaf">ENGLISH VISUAL LAB</p>
      <h1 class="font-display mt-3 text-3xl font-bold sm:text-5xl">
        把英语<span class="text-sun">画</span>出来
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-7 text-paper/80 sm:text-base">
        用时间线理解时态，用地图理解介词，用图谱理解发音，用拆解理解句子。
        每个概念都配双语例句和配套练习，看懂之后再亲手练一遍。
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink to="/tenses" class="btn bg-sun text-ink hover:bg-sun/90">从时态时间线开始 →</RouterLink>
        <RouterLink to="/quiz" class="btn border border-paper/40 text-paper hover:bg-paper/10">直接做练习</RouterLink>
      </div>

      <!-- 学习统计 -->
      <div class="mt-8 flex flex-wrap gap-6 text-sm">
        <div>
          <p class="font-display text-2xl font-bold">{{ Object.keys(progress.visits).length }}</p>
          <p class="text-paper/60">已探索模块</p>
        </div>
        <div>
          <p class="font-display text-2xl font-bold">
            {{ Object.values(progress.quizStats).reduce((s, v) => s + v.done, 0) }}
          </p>
          <p class="text-paper/60">已做练习</p>
        </div>
        <div>
          <p class="font-display text-2xl font-bold text-sun">{{ progress.mistakes.length }}</p>
          <p class="text-paper/60">待复习错题</p>
        </div>
      </div>
    </section>

    <!-- 模块卡片 -->
    <section class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="m in modules"
        :key="m.to"
        :to="m.to"
        class="card group flex flex-col p-5 transition hover:-translate-y-1 hover:border-pine/40 hover:shadow-lg"
      >
        <div class="flex items-center justify-between">
          <span class="text-3xl">{{ m.icon }}</span>
          <span class="text-[10px] tracking-widest text-ink/30">{{ m.en.toUpperCase() }}</span>
        </div>
        <h2 class="mt-3 text-lg font-bold text-ink group-hover:text-pine">{{ m.title }}</h2>
        <p class="mt-2 flex-1 text-sm leading-6 text-ink/60">{{ m.desc }}</p>
        <div class="mt-4 flex gap-2">
          <span v-for="t in m.tags" :key="t" class="tag bg-pine/10 text-pine">{{ t }}</span>
        </div>
      </RouterLink>
    </section>

    <!-- 专项练习入口 -->
    <section class="card mt-8 p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-lg font-bold">专项自测</h2>
        <RouterLink to="/mistakes" class="text-sm text-clay hover:underline">
          错题本（{{ progress.mistakes.length }}）→
        </RouterLink>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <RouterLink
          v-for="t in quizTopics"
          :key="t.key"
          :to="`/quiz/${t.key}`"
          class="rounded-xl border border-ink/10 p-4 transition hover:border-pine hover:bg-pine/5"
        >
          <p class="font-medium">{{ t.label }}</p>
          <p class="mt-1 text-xs text-ink/50">{{ t.desc }}</p>
          <p v-if="progress.quizStats[t.key]" class="mt-2 text-xs text-moss">
            已做 {{ progress.quizStats[t.key].done }} 题 · 正确率
            {{ Math.round((progress.quizStats[t.key].correct / progress.quizStats[t.key].done) * 100) }}%
          </p>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

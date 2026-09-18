<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { tenses, tenseGroups } from '../data/tenses'
import { markVisit } from '../stores/progress'
import { speak } from '../utils/speech'

onMounted(() => markVisit('tenses'))

const activeId = ref('present-perfect')
const active = computed(() => tenses.find((t) => t.id === activeId.value))
const groupColor = (key) => tenseGroups.find((g) => g.key === key)?.color

// 时间线坐标：0-100 映射到 SVG 宽度 1000
const W = 1000
const px = (pos) => (pos / 100) * W
const NOW_X = px(50)
</script>

<template>
  <div>
    <header class="mb-5">
      <h1 class="font-display text-2xl font-bold text-pine">时态时间线</h1>
      <p class="mt-1 text-sm text-ink/60">
        时间线演示的是动作与时间的关系：有的钉在一个<strong>点</strong>上，有的覆盖一段<strong>区间</strong>，有的横跨过去与现在。点击时间轴上的标记查看每个时态。
      </p>
    </header>

    <!-- 时间轴 -->
    <div class="card overflow-x-auto p-4">
      <svg :viewBox="`0 0 ${W} 190`" class="min-w-[720px]" role="img" aria-label="时态时间线">
        <!-- 主轴 -->
        <line x1="20" :y1="90" :x2="W - 20" y2="90" stroke="#22301f" stroke-width="2" />
        <polygon :points="`${W - 14},85 ${W - 2},90 ${W - 14},95`" fill="#22301f" />

        <!-- 区域标签 -->
        <text :x="px(25)" y="30" text-anchor="middle" font-size="15" fill="#c65f3d" font-weight="bold">过去 PAST</text>
        <text :x="NOW_X" y="30" text-anchor="middle" font-size="15" fill="#2f5233" font-weight="bold">现在 NOW</text>
        <text :x="px(80)" y="30" text-anchor="middle" font-size="15" fill="#3d6ec6" font-weight="bold">未来 FUTURE</text>

        <!-- 现在竖线 -->
        <line :x1="NOW_X" y1="45" :x2="NOW_X" y2="160" stroke="#2f5233" stroke-width="2" stroke-dasharray="5 4" />
        <circle :cx="NOW_X" cy="90" r="5" fill="#2f5233" />

        <!-- 每个时态的标记 -->
        <g v-for="(t, i) in tenses" :key="t.id" class="cursor-pointer" @click="activeId = t.id">
          <!-- 区间（span） -->
          <rect
            v-if="t.span"
            :x="px(t.span[0])"
            :y="i % 2 === 0 ? 108 : 62"
            :width="px(t.span[1]) - px(t.span[0])"
            height="10"
            rx="5"
            :fill="groupColor(t.group)"
            :opacity="activeId === t.id ? 0.9 : 0.35"
          />
          <!-- 点 -->
          <circle
            v-else
            :cx="px(t.pos)"
            :cy="i % 2 === 0 ? 113 : 67"
            r="7"
            :fill="groupColor(t.group)"
            :opacity="activeId === t.id ? 1 : 0.45"
          />
          <!-- 引线 -->
          <line
            :x1="t.span ? px((t.span[0] + t.span[1]) / 2) : px(t.pos)"
            :y1="i % 2 === 0 ? 118 : 74"
            :x2="t.span ? px((t.span[0] + t.span[1]) / 2) : px(t.pos)"
            :y2="i % 2 === 0 ? 148 : 42"
            :stroke="groupColor(t.group)"
            stroke-width="1"
            :opacity="activeId === t.id ? 0.9 : 0.3"
          />
          <!-- 名称 -->
          <text
            :x="t.span ? px((t.span[0] + t.span[1]) / 2) : px(t.pos)"
            :y="i % 2 === 0 ? 165 : 20"
            text-anchor="middle"
            font-size="12"
            :fill="activeId === t.id ? groupColor(t.group) : '#8a8f85'"
            :font-weight="activeId === t.id ? 'bold' : 'normal'"
          >{{ t.name }}</text>
        </g>
      </svg>
      <div class="mt-1 flex gap-4 text-xs text-ink/50">
        <span><i class="mr-1 inline-block h-2 w-2 rounded-full bg-pine align-middle" />点 = 某时刻发生</span>
        <span><i class="mr-1 inline-block h-2 w-6 rounded bg-pine/60 align-middle" />段 = 持续一段时间</span>
      </div>
    </div>

    <!-- 选中时态详情 -->
    <div v-if="active" class="card mt-5 p-5">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="font-display text-xl font-bold" :style="{ color: groupColor(active.group) }">{{ active.name }}</h2>
        <span class="text-sm text-ink/40">{{ active.en }}</span>
        <span class="tag" :style="{ backgroundColor: groupColor(active.group) + '1a', color: groupColor(active.group) }">
          {{ tenseGroups.find((g) => g.key === active.group).label }}家族
        </span>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div class="rounded-xl bg-paper p-4">
          <p class="text-xs font-bold text-ink/40">结构公式</p>
          <p class="mt-1 font-mono text-sm font-bold text-pine">{{ active.formula }}</p>
        </div>
        <div class="rounded-xl bg-paper p-4">
          <p class="text-xs font-bold text-ink/40">时间标志词</p>
          <p class="mt-1 text-sm text-ink/70">{{ active.signal }}</p>
        </div>
        <div class="rounded-xl bg-paper p-4">
          <p class="text-xs font-bold text-ink/40">一句话理解</p>
          <p class="mt-1 text-sm leading-6 text-ink/70">{{ active.explain }}</p>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <div
          v-for="(ex, i) in active.examples"
          :key="i"
          class="flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-4 py-3"
        >
          <div>
            <p class="font-medium" lang="en">{{ ex.en }}</p>
            <p class="text-sm text-ink/50">{{ ex.zh }}</p>
          </div>
          <button class="btn-ghost shrink-0" @click="speak(ex.en)" aria-label="朗读例句">🔊</button>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <RouterLink to="/quiz/tenses" class="btn-primary">做时态练习 →</RouterLink>
      </div>
    </div>

    <!-- 时态选择列表（小屏备选） -->
    <div class="mt-5 flex flex-wrap gap-2">
      <button
        v-for="t in tenses"
        :key="t.id"
        class="tag border transition"
        :class="activeId === t.id ? 'border-pine bg-pine text-paper' : 'border-ink/15 bg-white text-ink/60 hover:border-pine'"
        @click="activeId = t.id"
      >
        {{ t.name }}
      </button>
    </div>
  </div>
</template>

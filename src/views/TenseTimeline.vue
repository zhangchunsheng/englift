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

// 标签车道：上 3 行 / 下 3 行，贪心分配避免重叠
const laneY = { above: [66, 48, 30], below: [116, 138, 160] }
const labels = computed(() => {
  const items = tenses
    .map((t) => ({
      t,
      x: t.span ? px((t.span[0] + t.span[1]) / 2) : px(t.pos),
      w: t.name.length * 12 + 14, // 估算中文标签宽度
    }))
    .sort((a, b) => a.x - b.x)

  const edge = { above: [-Infinity, -Infinity, -Infinity], below: [-Infinity, -Infinity, -Infinity] }
  return items.map((item, i) => {
    // 奇偶交替优先上/下，让标签分布均匀
    const order =
      i % 2 === 0
        ? [['below', 0], ['above', 0], ['below', 1], ['above', 1], ['below', 2], ['above', 2]]
        : [['above', 0], ['below', 0], ['above', 1], ['below', 1], ['above', 2], ['below', 2]]
    let side = 'below'
    let lane = 2
    for (const [s, l] of order) {
      if (item.x - item.w / 2 > edge[s][l] + 10) {
        side = s
        lane = l
        break
      }
    }
    edge[side][lane] = item.x + item.w / 2
    return { ...item, side, lane, y: laneY[side][lane] }
  })
})
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
      <svg :viewBox="`0 0 ${W} 180`" class="min-w-[720px]" role="img" aria-label="时态时间线">
        <!-- 主轴 -->
        <line x1="20" y1="90" :x2="W - 20" y2="90" stroke="#22301f" stroke-width="2" />
        <polygon :points="`${W - 14},85 ${W - 2},90 ${W - 14},95`" fill="#22301f" />

        <!-- 区域标签 -->
        <text :x="px(25)" y="14" text-anchor="middle" font-size="14" fill="#c65f3d" font-weight="bold">过去 PAST</text>
        <text :x="NOW_X" y="14" text-anchor="middle" font-size="14" fill="#2f5233" font-weight="bold">现在 NOW</text>
        <text :x="px(80)" y="14" text-anchor="middle" font-size="14" fill="#3d6ec6" font-weight="bold">未来 FUTURE</text>

        <!-- 现在竖线 -->
        <line :x1="NOW_X" y1="20" :x2="NOW_X" y2="168" stroke="#2f5233" stroke-width="2" stroke-dasharray="5 4" />

        <!-- 每个时态：轴上标记 + 引线 + 车道标签 -->
        <g v-for="item in labels" :key="item.t.id" class="cursor-pointer" @click="activeId = item.t.id">
          <!-- 区间标记（轴上） -->
          <rect
            v-if="item.t.span"
            :x="px(item.t.span[0])"
            y="84"
            :width="px(item.t.span[1]) - px(item.t.span[0])"
            height="12"
            rx="6"
            :fill="groupColor(item.t.group)"
            :opacity="activeId === item.t.id ? 0.95 : 0.3"
            :stroke="groupColor(item.t.group)"
            :stroke-width="activeId === item.t.id ? 1.5 : 0"
          />
          <!-- 点标记（轴上） -->
          <circle
            v-else
            :cx="px(item.t.pos)"
            cy="90"
            :r="activeId === item.t.id ? 8 : 6"
            :fill="groupColor(item.t.group)"
            :opacity="activeId === item.t.id ? 1 : 0.5"
            stroke="#f5f7f0"
            stroke-width="1.5"
          />
          <!-- 引线：从轴线到标签车道 -->
          <line
            :x1="item.x"
            :y1="item.side === 'below' ? 100 : 80"
            :x2="item.x"
            :y2="item.side === 'below' ? item.y - 10 : item.y + 5"
            :stroke="groupColor(item.t.group)"
            :stroke-width="activeId === item.t.id ? 1.5 : 1"
            :opacity="activeId === item.t.id ? 0.9 : 0.35"
          />
          <!-- 标签 -->
          <text
            :x="item.x"
            :y="item.y"
            text-anchor="middle"
            font-size="12"
            :fill="activeId === item.t.id ? groupColor(item.t.group) : '#8a8f85'"
            :font-weight="activeId === item.t.id ? 'bold' : 'normal'"
          >{{ item.t.name }}</text>
        </g>

        <!-- 现在标记（置顶，避免被区间条遮挡） -->
        <circle :cx="NOW_X" cy="90" r="6" fill="#2f5233" stroke="#f5f7f0" stroke-width="2" />
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

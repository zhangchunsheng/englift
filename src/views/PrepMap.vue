<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { placePreps, movePreps } from '../data/prepositions'
import { markVisit } from '../stores/progress'
import { speak } from '../utils/speech'
import SpeakScore from '../components/SpeakScore.vue'

onMounted(() => markVisit('prepositions'))

const tab = ref('place') // place | move
const activeWord = ref(placePreps[0].word)
const list = computed(() => (tab.value === 'place' ? placePreps : movePreps))
const active = computed(() => list.value.find((p) => p.word === activeWord.value) || list.value[0])

function switchTab(t) {
  tab.value = t
  activeWord.value = (t === 'place' ? placePreps : movePreps)[0].word
}
</script>

<template>
  <div>
    <header class="mb-5">
      <h1 class="font-display text-2xl font-bold text-pine">介词街区地图</h1>
      <p class="mt-1 text-sm text-ink/60">
        方位介词画在地图上，移动介词画成路线。点击标注或列表，读例句，再试着描述身边的地点。
      </p>
    </header>

    <div class="mb-4 flex gap-2">
      <button
        class="btn"
        :class="tab === 'place' ? 'bg-pine text-paper' : 'border border-ink/15 bg-white text-ink/60'"
        @click="switchTab('place')"
      >📍 方位介词</button>
      <button
        class="btn"
        :class="tab === 'move' ? 'bg-pine text-paper' : 'border border-ink/15 bg-white text-ink/60'"
        @click="switchTab('move')"
      >🚶 移动介词</button>
    </div>

    <div class="grid gap-5 lg:grid-cols-5">
      <!-- 地图 -->
      <div class="card overflow-hidden lg:col-span-3">
        <svg viewBox="0 0 600 400" class="w-full" role="img" aria-label="街区地图">
          <!-- 背景草地 -->
          <rect width="600" height="400" fill="#eef2e6" />
          <!-- 街道 -->
          <rect x="0" y="180" width="600" height="46" fill="#d8d3c3" />
          <rect x="285" y="0" width="46" height="400" fill="#d8d3c3" />
          <line x1="0" y1="203" x2="600" y2="203" stroke="#fff" stroke-width="3" stroke-dasharray="16 12" />
          <line x1="308" y1="0" x2="308" y2="400" stroke="#fff" stroke-width="3" stroke-dasharray="16 12" />

          <!-- 房子（中心参照物） -->
          <g>
            <rect x="240" y="110" width="80" height="60" fill="#c65f3d" rx="4" />
            <polygon points="235,110 280,75 325,110" fill="#a34a2e" />
            <rect x="268" y="135" width="24" height="35" fill="#f5f7f0" />
            <text x="280" y="104" text-anchor="middle" font-size="11" fill="#fff" font-weight="bold">HOUSE</text>
          </g>

          <!-- 树 -->
          <g v-for="(pos, i) in [[70, 140], [520, 130], [540, 300]]" :key="i">
            <circle :cx="pos[0]" :cy="pos[1]" r="18" fill="#4a7c59" />
            <rect :x="pos[0] - 3" :y="pos[1] + 12" width="6" height="16" fill="#8a6a4a" />
          </g>

          <!-- 湖 -->
          <ellipse cx="110" cy="320" rx="70" ry="38" fill="#a8c8e0" />
          <text x="110" y="324" text-anchor="middle" font-size="11" fill="#4a6a8a">LAKE</text>

          <!-- 方位介词标注 -->
          <g v-if="tab === 'place'">
            <g
              v-for="p in placePreps"
              :key="p.word"
              class="cursor-pointer"
              @click="activeWord = p.word"
            >
              <circle
                :cx="(p.x / 100) * 600"
                :cy="(p.y / 100) * 400"
                r="14"
                :fill="activeWord === p.word ? '#2f5233' : '#ffffff'"
                :stroke="activeWord === p.word ? '#2f5233' : '#8a8f85'"
                stroke-width="1.5"
              />
              <text
                :x="(p.x / 100) * 600"
                :y="(p.y / 100) * 400 + 4"
                text-anchor="middle"
                font-size="9"
                font-weight="bold"
                :fill="activeWord === p.word ? '#fff' : '#22301f'"
              >{{ p.word.length > 6 ? p.word.slice(0, 6) + '…' : p.word }}</text>
            </g>
          </g>

          <!-- 移动介词路线 -->
          <g v-else>
            <path d="M 60 330 Q 150 250 240 190" fill="none" stroke="#c65f3d" stroke-width="3" stroke-dasharray="8 6" marker-end="url(#arrow)" />
            <text x="120" y="255" font-size="12" fill="#c65f3d" font-weight="bold">into</text>
            <path d="M 330 140 Q 420 100 500 130" fill="none" stroke="#3d6ec6" stroke-width="3" stroke-dasharray="8 6" marker-end="url(#arrow)" />
            <text x="410" y="90" font-size="12" fill="#3d6ec6" font-weight="bold">out of</text>
            <path d="M 60 203 L 560 203" fill="none" stroke="#e8a33d" stroke-width="3" stroke-dasharray="8 6" marker-end="url(#arrow)" />
            <text x="70" y="195" font-size="12" fill="#b07c22" font-weight="bold">across / along / past</text>
            <path d="M 290 370 L 325 250" fill="none" stroke="#7a4fc6" stroke-width="3" stroke-dasharray="8 6" marker-end="url(#arrow)" />
            <text x="300" y="390" font-size="12" fill="#7a4fc6" font-weight="bold">towards</text>
            <path d="M 460 320 Q 400 340 350 240 Q 340 150 290 90" fill="none" stroke="#2f5233" stroke-width="3" stroke-dasharray="8 6" marker-end="url(#arrow)" />
            <text x="430" y="345" font-size="12" fill="#2f5233" font-weight="bold">through / over / around</text>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0,0 7,3 0,6" fill="currentColor" opacity="0.6" />
              </marker>
            </defs>
          </g>
        </svg>
      </div>

      <!-- 列表 + 详情 -->
      <div class="lg:col-span-2">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in list"
            :key="p.word"
            class="tag border transition"
            :class="activeWord === p.word ? 'border-pine bg-pine text-paper' : 'border-ink/15 bg-white text-ink/60 hover:border-pine'"
            @click="activeWord = p.word"
          >{{ p.word }}</button>
        </div>

        <div v-if="active" class="card mt-4 p-5">
          <div class="flex items-baseline justify-between">
            <h2 class="font-display text-2xl font-bold text-pine" lang="en">{{ active.word }}</h2>
            <span class="text-sm text-ink/60">{{ active.zh }}</span>
          </div>
          <p v-if="active.note" class="mt-2 rounded-lg bg-sun/10 px-3 py-2 text-xs leading-5 text-ink/70">
            💡 {{ active.note }}
          </p>
          <div class="mt-3 rounded-xl border border-ink/10 p-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-medium" lang="en">{{ active.example.en }}</p>
                <p class="mt-0.5 text-sm text-ink/50">{{ active.example.zh }}</p>
              </div>
              <button class="btn-ghost shrink-0" @click="speak(active.example.en)" aria-label="朗读例句">🔊</button>
            </div>
            <SpeakScore :key="active.word" :text="active.example.en" class="mt-2" />
          </div>
        </div>

        <!-- across vs through 辨析 -->
        <div class="card mt-4 border-sun/40 bg-sun/5 p-4 text-sm leading-6">
          <p class="font-bold text-ink">易混辨析：across vs through vs over</p>
          <ul class="mt-2 list-inside list-disc text-ink/70">
            <li><b>across</b>：从<strong>表面</strong>一边到另一边 — across the street</li>
            <li><b>through</b>：从<strong>内部空间</strong>穿过 — through the tunnel / forest</li>
            <li><b>over</b>：从<strong>上方越过</strong> — over the bridge / wall</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mt-5 flex justify-end">
      <RouterLink to="/quiz/prepositions" class="btn-primary">做介词练习 →</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { patterns, roleLegend } from '../data/sentences'
import { markVisit } from '../stores/progress'
import { speak } from '../utils/speech'
import SpeakScore from '../components/SpeakScore.vue'

onMounted(() => markVisit('sentences'))

const patternId = ref(patterns[0].id)
const sentenceIdx = ref(0)
const showLabels = ref(true)
const selectedChunk = ref(null)

const pattern = computed(() => patterns.find((p) => p.id === patternId.value))
const sentence = computed(() => pattern.value.sentences[sentenceIdx.value])

const roleInfo = (role) => roleLegend.find((r) => r.role === role)

function selectPattern(id) {
  patternId.value = id
  sentenceIdx.value = 0
  selectedChunk.value = null
}

function clickChunk(chunk) {
  selectedChunk.value = chunk === selectedChunk.value ? null : chunk
}
</script>

<template>
  <div>
    <header class="mb-5">
      <h1 class="font-display text-2xl font-bold text-pine">句子拆解</h1>
      <p class="mt-1 text-sm text-ink/60">
        英语句子万变不离五种基本句型。点击词块看它扮演什么成分、为什么这样分；隐藏标签后自己判断，最后用配套练习巩固。
      </p>
    </header>

    <!-- 五种句型 -->
    <div class="mb-5 grid gap-3 sm:grid-cols-5">
      <button
        v-for="p in patterns"
        :key="p.id"
        class="card p-3 text-left transition hover:shadow-md"
        :class="{ 'ring-2': patternId === p.id }"
        :style="patternId === p.id ? { '--tw-ring-color': p.color } : {}"
        @click="selectPattern(p.id)"
      >
        <p class="font-mono text-xs font-bold" :style="{ color: p.color }">{{ p.formula }}</p>
        <p class="mt-1 text-sm font-bold">{{ p.name }}</p>
      </button>
    </div>

    <!-- 句型讲解 -->
    <div class="card p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold" :style="{ color: pattern.color }">{{ pattern.name }} <span class="font-mono text-sm font-normal text-ink/40">{{ pattern.formula }}</span></h2>
          <p class="mt-1 text-sm text-ink/60">{{ pattern.desc }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex rounded-xl border border-ink/15 bg-white p-1 text-xs">
            <button
              v-for="(s, i) in pattern.sentences"
              :key="i"
              class="rounded-lg px-2.5 py-1"
              :class="sentenceIdx === i ? 'bg-pine text-paper' : 'text-ink/60'"
              @click="sentenceIdx = i; selectedChunk = null"
            >例句 {{ i + 1 }}</button>
          </div>
          <button class="btn-ghost text-xs" @click="showLabels = !showLabels">
            {{ showLabels ? '隐藏标签，自己判断' : '显示标签' }}
          </button>
        </div>
      </div>

      <!-- 词块拆解 -->
      <div class="mt-6 flex flex-wrap items-end gap-x-1 gap-y-8 rounded-2xl bg-paper p-6">
        <button
          v-for="(chunk, i) in sentence.chunks"
          :key="i"
          class="group relative rounded-lg border-b-4 px-3 py-2 text-lg font-medium transition hover:-translate-y-0.5"
          :style="{
            borderColor: showLabels || selectedChunk === chunk ? roleInfo(chunk.role).color : '#c8ccc2',
            backgroundColor: selectedChunk === chunk ? roleInfo(chunk.role).color + '18' : 'white',
          }"
          lang="en"
          @click="clickChunk(chunk)"
        >
          {{ chunk.text }}
          <span
            v-if="showLabels"
            class="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            :style="{ backgroundColor: roleInfo(chunk.role).color }"
          >{{ roleInfo(chunk.role).label }}</span>
        </button>
        <button class="btn-ghost ml-2 shrink-0" @click="speak(sentence.chunks.map((c) => c.text).join(' '))" aria-label="朗读整句">🔊</button>
      </div>
      <p class="mt-2 text-center text-sm text-ink/50">{{ sentence.zh }}</p>

      <!-- 整句跟读评分 -->
      <div class="mt-4 flex justify-center">
        <SpeakScore
          :key="patternId + '-' + sentenceIdx"
          :text="sentence.chunks.map((c) => c.text).join(' ')"
        />
      </div>

      <!-- 点击词块的解释 -->
      <transition name="pop">
        <div
          v-if="selectedChunk"
          class="mt-4 rounded-xl border-l-4 bg-white p-4 shadow-sm"
          :style="{ borderColor: roleInfo(selectedChunk.role).color }"
        >
          <p class="font-medium">
            「<span lang="en">{{ selectedChunk.text }}</span>」是
            <b :style="{ color: roleInfo(selectedChunk.role).color }">{{ roleInfo(selectedChunk.role).label }}</b>
          </p>
          <p class="mt-1 text-sm text-ink/60">{{ sentence.notes[selectedChunk.role] || roleInfo(selectedChunk.role).desc }}</p>
        </div>
        <p v-else class="mt-4 text-center text-xs text-ink/40">👆 点击词块查看它的工作</p>
      </transition>
    </div>

    <!-- 成分图例 -->
    <div class="card mt-5 p-5">
      <h3 class="text-sm font-bold text-ink/50">句子成分图例</h3>
      <div class="mt-3 flex flex-wrap gap-3">
        <span
          v-for="r in roleLegend"
          :key="r.role"
          class="tag border"
          :style="{ borderColor: r.color, color: r.color, backgroundColor: r.color + '12' }"
        >{{ r.label }} · {{ r.desc }}</span>
      </div>
    </div>

    <div class="mt-5 flex justify-end">
      <RouterLink to="/quiz/sentences" class="btn-primary">做句法练习 →</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.pop-enter-active {
  transition: all 0.2s ease;
}
.pop-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

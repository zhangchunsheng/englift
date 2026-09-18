<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { vowels, consonants, confusables } from '../data/phonemes'
import { markVisit } from '../stores/progress'
import { speak } from '../utils/speech'
import SpeakScore from '../components/SpeakScore.vue'

onMounted(() => markVisit('phonemes'))

const selected = ref(null) // 当前选中的音标
const tab = ref('chart') // chart | confusables

function pick(p) {
  selected.value = p
  speak(p.word)
}
</script>

<template>
  <div>
    <header class="mb-5">
      <h1 class="font-display text-2xl font-bold text-pine">音标图谱</h1>
      <p class="mt-1 text-sm text-ink/60">
        48 个国际音标：单元音、双元音、清浊成对的辅音。点击任意音标卡片听例词发音，看口型提示。
      </p>
    </header>

    <div class="mb-4 flex gap-2">
      <button class="btn" :class="tab === 'chart' ? 'bg-pine text-paper' : 'border border-ink/15 bg-white text-ink/60'" @click="tab = 'chart'">📊 完整图谱</button>
      <button class="btn" :class="tab === 'confusables' ? 'bg-pine text-paper' : 'border border-ink/15 bg-white text-ink/60'" @click="tab = 'confusables'">⚖️ 易混音对比</button>
    </div>

    <div v-if="tab === 'chart'" class="grid gap-5 lg:grid-cols-3">
      <div class="space-y-5 lg:col-span-2">
        <!-- 单元音 -->
        <section class="card p-4">
          <h2 class="mb-3 text-sm font-bold text-ink/50">单元音 · 12 个（前 4 个为前元音，口型由小到大）</h2>
          <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
            <button
              v-for="p in vowels.mono"
              :key="p.ipa"
              class="rounded-xl border px-2 py-2.5 text-center transition hover:border-pine hover:bg-pine/5"
              :class="selected?.ipa === p.ipa ? 'border-pine bg-pine/10 ring-1 ring-pine' : 'border-ink/10'"
              @click="pick(p)"
            >
              <p class="font-mono font-bold text-pine">{{ p.ipa }}</p>
              <p class="mt-0.5 text-xs text-ink/50" lang="en">{{ p.word }}</p>
            </button>
          </div>
        </section>

        <!-- 双元音 -->
        <section class="card p-4">
          <h2 class="mb-3 text-sm font-bold text-ink/50">双元音 · 8 个（由一个音滑向另一个音）</h2>
          <div class="grid grid-cols-4 gap-2 sm:grid-cols-8">
            <button
              v-for="p in vowels.diph"
              :key="p.ipa"
              class="rounded-xl border px-2 py-2.5 text-center transition hover:border-sun hover:bg-sun/5"
              :class="selected?.ipa === p.ipa ? 'border-sun bg-sun/10 ring-1 ring-sun' : 'border-ink/10'"
              @click="pick(p)"
            >
              <p class="font-mono font-bold text-sun">{{ p.ipa }}</p>
              <p class="mt-0.5 text-xs text-ink/50" lang="en">{{ p.word }}</p>
            </button>
          </div>
        </section>

        <!-- 辅音：清浊成对 -->
        <section class="card p-4">
          <h2 class="mb-3 text-sm font-bold text-ink/50">辅音 · 28 个（清浊成对排列，摸喉咙感受声带振动）</h2>
          <div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
            <button
              v-for="p in consonants"
              :key="p.ipa"
              class="rounded-xl border px-2 py-2.5 text-center transition hover:border-clay hover:bg-clay/5"
              :class="selected?.ipa === p.ipa ? 'border-clay bg-clay/10 ring-1 ring-clay' : 'border-ink/10'"
              @click="pick(p)"
            >
              <p class="font-mono font-bold text-clay">{{ p.ipa }}</p>
              <p class="mt-0.5 text-xs text-ink/50" lang="en">{{ p.word }}</p>
            </button>
          </div>
        </section>
      </div>

      <!-- 详情侧栏 -->
      <aside class="lg:sticky lg:top-20 lg:self-start">
        <div v-if="selected" class="card p-5">
          <p class="font-mono text-4xl font-bold text-pine">{{ selected.ipa }}</p>
          <div class="mt-3 flex items-center gap-3">
            <button class="btn-primary" @click="speak(selected.word)">🔊 {{ selected.word }}</button>
            <span class="text-sm text-ink/50">{{ selected.zh }}</span>
          </div>
          <p class="mt-4 rounded-lg bg-paper px-3 py-2 text-sm leading-6 text-ink/70">👄 {{ selected.tip }}</p>
          <p v-if="selected.pair" class="mt-2 text-xs text-ink/40">
            清浊对应：{{ selected.ipa }} ↔ {{ selected.pair }}（发音部位相同，只差声带是否振动）
          </p>
          <!-- 跟读例词评分 -->
          <div class="mt-4 border-t border-ink/10 pt-3">
            <p class="mb-1 text-xs text-ink/40">读出例词，测试发音：</p>
            <SpeakScore :key="selected.ipa" :text="selected.word" />
          </div>
        </div>
        <div v-else class="card p-5 text-sm text-ink/40">
          👈 点击左侧任意音标卡片，听例词发音并查看口型提示。
        </div>

        <RouterLink to="/quiz/phonemes" class="btn-primary mt-4 w-full">做辨音练习 →</RouterLink>
      </aside>
    </div>

    <!-- 易混音对比 -->
    <div v-else class="grid gap-4 sm:grid-cols-2">
      <div v-for="(c, i) in confusables" :key="i" class="card p-5">
        <div class="flex items-center justify-center gap-6">
          <div class="text-center">
            <p class="font-mono text-2xl font-bold text-pine">{{ c.a }}</p>
            <button class="btn-ghost mt-2 text-xs" @click="speak(c.aWord.replace(/（.*）/, ''))">🔊 {{ c.aWord }}</button>
          </div>
          <span class="text-xl text-ink/30">⚡</span>
          <div class="text-center">
            <p class="font-mono text-2xl font-bold text-clay">{{ c.b }}</p>
            <button class="btn-ghost mt-2 text-xs" @click="speak(c.bWord.replace(/（.*）/, ''))">🔊 {{ c.bWord }}</button>
          </div>
        </div>
        <p class="mt-4 rounded-lg bg-paper px-3 py-2 text-center text-sm text-ink/70">💡 区别：{{ c.tip }}</p>
      </div>
    </div>
  </div>
</template>

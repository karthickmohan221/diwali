<script setup lang="ts">
import { decodeGreeting, PRESET_DIWALI_WISHES, type DiwaliGreetingData } from '~/utils/greeting'
import { diwaliAudio } from '~/utils/audio'
import type { CrackerType, RangoliTheme } from '~/components/CrackerToolbar.vue'

const route = useRoute()
const greetingData = computed<DiwaliGreetingData>(() => decodeGreeting(route.params.id))
const sender = computed(() => greetingData.value.sender)
const recipient = computed(() => greetingData.value.recipient)
const wish = computed(() => greetingData.value.wish || PRESET_DIWALI_WISHES[0])

const lit = ref(false)
const revealed = ref(false)
const candlesLit = ref(false)
const celebrationTap = ref(0)
const clickPosition = ref({ x: 0, y: 0 })
const soundEnabled = ref(false)

const activeCracker = ref<CrackerType>('rocket')
const aartiActive = ref(false)
const flowerShower = ref(false)
const currentTheme = ref<RangoliTheme>('gold')

let revealTimer: ReturnType<typeof setTimeout> | undefined
let aartiTimer: ReturnType<typeof setTimeout> | undefined

// Initialize theme from greeting data
watch(() => greetingData.value.theme, (th) => {
  if (th) currentTheme.value = th
}, { immediate: true })

useHead(() => {
  const pageTitle = recipient.value
    ? `Happy Diwali ${recipient.value} — from ${sender.value}`
    : `A Diwali gift from ${sender.value}`
  return {
    title: pageTitle,
    meta: [
      { name: 'description', content: `Open an interactive 3D glowing Diwali greeting from ${sender.value}. Light a diya, burst fireworks, and celebrate Deepavali!` },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: wish.value },
    ],
  }
})

const lightDiya = async () => {
  if (lit.value) return
  lit.value = true
  candlesLit.value = true

  // Auto-enable audio on user's first explicit lighting gesture
  if (!soundEnabled.value) {
    const ok = await diwaliAudio.enable()
    if (ok) soundEnabled.value = true
  }
  diwaliAudio.playDiyaLightTone()

  revealTimer = setTimeout(() => {
    revealed.value = true
    flowerShower.value = true
    // Stop initial petal shower after 6 seconds to keep it balanced
    setTimeout(() => {
      if (!aartiActive.value) flowerShower.value = false
    }, 6000)
  }, 950)
}

const celebrateClick = (event: PointerEvent) => {
  const stage = event.currentTarget
  if (!(stage instanceof HTMLElement)) return
  const bounds = stage.getBoundingClientRect()
  clickPosition.value = {
    x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    y: -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  }
  celebrationTap.value += 1
}

const toggleSound = async () => {
  const active = await diwaliAudio.toggle()
  soundEnabled.value = active
}

const toggleAarti = () => {
  aartiActive.value = !aartiActive.value
  if (aartiActive.value) {
    flowerShower.value = true
    diwaliAudio.playAartiChimes()
    if (aartiTimer) clearTimeout(aartiTimer)
    aartiTimer = setTimeout(() => {
      aartiActive.value = false
      flowerShower.value = false
    }, 7000)
  } else {
    flowerShower.value = false
    if (aartiTimer) clearTimeout(aartiTimer)
  }
}

const toggleFlowerShower = () => {
  flowerShower.value = !flowerShower.value
}

const cycleTheme = () => {
  const order: RangoliTheme[] = ['gold', 'peacock', 'kumkum']
  const idx = order.indexOf(currentTheme.value)
  currentTheme.value = order[(idx + 1) % order.length] ?? 'gold'
  if (soundEnabled.value) {
    diwaliAudio.playTempleBell(1.3)
  }
}

const watchAgain = () => {
  if (revealTimer) clearTimeout(revealTimer)
  if (aartiTimer) clearTimeout(aartiTimer)
  lit.value = false
  revealed.value = false
  candlesLit.value = false
  aartiActive.value = false
  flowerShower.value = false
}

// Audio Event Handlers from 3D Scene
const onCrackerExplosion = () => {
  diwaliAudio.playCracker()
}

const onRocketLaunch = () => {
  diwaliAudio.playRocketLaunch()
}

const onChakriSpin = () => {
  diwaliAudio.playChakri()
}

const onAnarBurst = () => {
  diwaliAudio.playAnar()
}

const onLadiPop = () => {
  diwaliAudio.playLadi()
}

const onLanternRelease = () => {
  diwaliAudio.playLanternChime()
}

const onSparklerSpark = () => {
  diwaliAudio.playSparklerSpark()
}

onBeforeUnmount(() => {
  if (revealTimer) clearTimeout(revealTimer)
  if (aartiTimer) clearTimeout(aartiTimer)
  diwaliAudio.dispose()
})
</script>

<template>
  <main class="gift-stage" @pointerdown.capture="celebrateClick">
    <!-- 3D WebGL Diwali Canvas -->
    <ClientOnly>
      <FestivalScene
        :revealed="lit"
        :candles-lit="candlesLit"
        :theme="currentTheme"
        :active-cracker="activeCracker"
        :celebration-tap="celebrationTap"
        :click-position="clickPosition"
        :aarti-active="aartiActive"
        :flower-shower="flowerShower"
        @cracker="onCrackerExplosion"
        @rocket-launch="onRocketLaunch"
        @chakri-spin="onChakriSpin"
        @anar-burst="onAnarBurst"
        @ladi-pop="onLadiPop"
        @lantern-release="onLanternRelease"
        @sparkler-spark="onSparklerSpark"
      />
    </ClientOnly>

    <div class="scene-shade" :class="{ 'is-lit': lit || candlesLit }" />

    <!-- Top Navigation & Brand Bar -->
    <div class="brand">
      <SkylinkLogo />
      <span class="brand-caption">Deepavali</span>
    </div>

    <!-- Festive Sound Control Button -->
    <button
      class="sound-button"
      type="button"
      :aria-label="soundEnabled ? 'Mute Diwali music and cracker sound effects' : 'Play Diwali music and cracker sound effects'"
      :aria-pressed="soundEnabled"
      :title="soundEnabled ? 'Sound On' : 'Turn Sound On'"
      @click="toggleSound"
    >
      <span aria-hidden="true">{{ soundEnabled ? '🔔' : '🔕' }}</span>
      <span class="sound-label">{{ soundEnabled ? 'Sound On' : 'Sound Off' }}</span>
    </button>

    <!-- UNLIT STATE: Invitation to Light the Diya -->
    <section v-if="!revealed" class="gift-content">
      <div v-if="lit" class="gift-copy">
        <div class="devanagari-accent">|| Happy Deepavali ||</div>
        <p class="gift-title">Happy Diwali</p>
        <p v-if="recipient" class="gift-recipient">For {{ recipient }}</p>
        <p class="gift-from">from {{ sender }}</p>
      </div>

      <div v-else class="gift-actions">
        <div class="unlit-badge">
          <span>✨ Divine Festival of Lights ✨</span>
        </div>
        <button class="tap-hint" type="button" aria-label="Tap here to light the diya" @click="lightDiya">
          <span aria-hidden="true">🪔</span>
          Tap to light the Diya
        </button>
        <button class="primary-button diya-ignite-btn" type="button" @click="lightDiya">
          <span aria-hidden="true">✦</span>
          Light the Diya &amp; Celebrate
        </button>
      </div>
    </section>

    <!-- REVEALED STATE: Full Festive Greeting & Interactive Cracker Toolbar -->
    <section v-else class="gift-content gift-content--revealed" aria-live="polite">
      <div class="gift-copy">
        <div class="devanagari-accent">|| Happy Deepavali ||</div>
        <p v-if="recipient" class="gift-recipient">For {{ recipient }}</p>
        <h1 class="gift-title">Happy Diwali</h1>
        <p class="gift-from">With warm wishes from <strong>{{ sender }}</strong></p>
        <p class="diwali-wish">{{ wish }}</p>
      </div>

      <!-- Next-Level Cracker & Ritual Toolbar -->
      <div class="celebration-toolbar-container">
        <CrackerToolbar
          v-model:active-cracker="activeCracker"
          :aarti-active="aartiActive"
          :flower-shower="flowerShower"
          :theme="currentTheme"
          @toggle-aarti="toggleAarti"
          @toggle-flower-shower="toggleFlowerShower"
          @cycle-theme="cycleTheme"
        />
        <p class="toolbar-hint">
          <span>💡</span>
          <span v-if="activeCracker === 'rocket'">Tap anywhere in the sky to launch colorful fireworks!</span>
          <span v-else-if="activeCracker === 'chakri'">Tap the courtyard ground to spin a glowing Chakri!</span>
          <span v-else-if="activeCracker === 'anar'">Tap courtyard to erupt a towering flowerpot fountain!</span>
          <span v-else-if="activeCracker === 'ladi'">Tap anywhere to ignite a rapid 1000-wala cracker burst!</span>
          <span v-else-if="activeCracker === 'sparkler'">Move your finger or mouse across the screen to sparkle!</span>
          <span v-else-if="activeCracker === 'lantern'">Tap to release glowing Sky Lanterns into the night!</span>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="gift-actions">
        <NuxtLink class="primary-button full-width-action" to="/send">
          <span aria-hidden="true">✨</span>
          Create &amp; Send Your Own Diwali Gift
        </NuxtLink>

        <button class="quiet-button" type="button" @click="watchAgain">Replay Lighting Ceremony</button>
      </div>
    </section>
  </main>
</template>

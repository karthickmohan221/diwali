<script setup lang="ts">
import { PRESET_DIWALI_WISHES, type DiwaliGreetingData } from '~/utils/greeting'
import type { RangoliTheme } from '~/components/CrackerToolbar.vue'

const sender = ref('')
const recipient = ref('')
const selectedWishIndex = ref(0)
const customWish = ref('')
const useCustomWish = ref(false)
const selectedTheme = ref<RangoliTheme>('gold')

const preview = ref(false)

useHead({
  title: 'Send a Personalized Diwali Greeting',
  meta: [
    { name: 'description', content: 'Create a customized glowing 3D Diwali greeting card with your name, personalized wish, and interactive fireworks to share on WhatsApp.' },
  ],
})

const activeWishText = computed(() => {
  if (useCustomWish.value && customWish.value.trim()) {
    return customWish.value.trim()
  }
  return PRESET_DIWALI_WISHES[selectedWishIndex.value] || PRESET_DIWALI_WISHES[0]
})

const showPreview = () => {
  const cleanSender = sender.value.trim()
  if (!cleanSender) return
  sender.value = cleanSender
  preview.value = true
}

const themeOptions: { id: RangoliTheme; label: string; icon: string; previewColor: string }[] = [
  { id: 'gold', label: 'Lotus Gold', icon: '🪷', previewColor: '#e8b65f' },
  { id: 'peacock', label: 'Peacock Emerald', icon: '🦚', previewColor: '#20b2aa' },
  { id: 'kumkum', label: 'Festive Kumkum', icon: '🌸', previewColor: '#d43048' },
]
</script>

<template>
  <main class="gift-stage">
    <!-- 3D Background Festival Scene -->
    <ClientOnly>
      <FestivalScene
        :revealed="preview"
        :candles-lit="preview"
        :theme="selectedTheme"
        :celebration-tap="0"
        :click-position="{ x: 0, y: 0 }"
      />
    </ClientOnly>

    <div class="scene-shade" :class="{ 'is-lit': preview }" />

    <div class="brand">
      <SkylinkLogo />
      <span class="brand-caption">Deepavali Card Creator</span>
    </div>

    <!-- CREATOR FORM (when not previewing) -->
    <form v-if="!preview" class="send-content" @submit.prevent="showPreview">
      <section class="send-panel">
        <NuxtLink class="send-panel-close" to="/" aria-label="Close greeting creator" title="Close">
          <span aria-hidden="true">&times;</span>
        </NuxtLink>
        <div class="send-eyebrow-badge">
          <span>✨ Craft Your Festive Gift ✨</span>
        </div>
        <h1 class="send-title">Send a Diwali Gift</h1>
        <p class="send-description">
          Create an interactive 3D glowing Diya card with your personal blessing and share with family &amp; friends.
        </p>

        <!-- Sender Name Input -->
        <div class="form-group">
          <label class="name-label" for="sender-name">
            Your name / family name <span class="required-star">*</span>
          </label>
          <input
            id="sender-name"
            v-model="sender"
            class="name-input"
            type="text"
            name="name"
            maxlength="48"
            autocomplete="name"
            placeholder="e.g. Aditya Sharma, The Mehtas, Skylink.in"
            required
          >
        </div>

        <!-- Optional Recipient Name Input -->
        <div class="form-group">
          <label class="name-label" for="recipient-name">
            Recipient's name <span class="optional-tag">(optional)</span>
          </label>
          <input
            id="recipient-name"
            v-model="recipient"
            class="name-input"
            type="text"
            name="recipient"
            maxlength="48"
            placeholder="e.g. My Dear Friends, Rahul, Mom &amp; Dad"
          >
        </div>

        <!-- Rangoli Color Theme Picker -->
        <div class="form-group">
          <label class="name-label">Rangoli &amp; Lighting Theme</label>
          <div class="theme-selector-grid">
            <button
              v-for="t in themeOptions"
              :key="t.id"
              type="button"
              class="theme-card-btn"
              :class="{ 'is-selected': selectedTheme === t.id }"
              @click="selectedTheme = t.id"
            >
              <span class="theme-color-dot" :style="{ background: t.previewColor }" />
              <span class="theme-card-icon">{{ t.icon }}</span>
              <span class="theme-card-label">{{ t.label }}</span>
            </button>
          </div>
        </div>

        <!-- Diwali Wish Selection -->
        <div class="form-group">
          <label class="name-label">Choose a Festive Blessing</label>
          <div class="wishes-preset-list">
            <button
              v-for="(w, idx) in PRESET_DIWALI_WISHES"
              :key="idx"
              type="button"
              class="preset-wish-btn"
              :class="{ 'is-active': !useCustomWish && selectedWishIndex === idx }"
              @click="useCustomWish = false; selectedWishIndex = idx"
            >
              {{ w }}
            </button>
          </div>

          <!-- Custom Wish Toggle -->
          <div class="custom-wish-toggle">
            <button
              type="button"
              class="toggle-link"
              @click="useCustomWish = !useCustomWish"
            >
              {{ useCustomWish ? '← Choose from standard wishes' : '✏️ Write your own custom wish' }}
            </button>
          </div>

          <textarea
            v-if="useCustomWish"
            v-model="customWish"
            class="name-input custom-wish-textarea"
            rows="3"
            maxlength="200"
            placeholder="Type your heartfelt Diwali message here..."
          />
        </div>

        <!-- Submit Button -->
        <button class="primary-button send-submit" type="submit" :disabled="!sender.trim()">
          Preview &amp; Share Your Diya
          <span aria-hidden="true">→</span>
        </button>
      </section>
    </form>

    <!-- LIVE PREVIEW & SHARING PANEL -->
    <section v-else class="send-preview" aria-live="polite">
      <div class="preview-badge">
        <span>👁️ Live Greeting Preview</span>
      </div>

      <div class="gift-copy">
        <div class="devanagari-accent">|| Happy Deepavali ||</div>
        <p v-if="recipient.trim()" class="gift-recipient">For {{ recipient.trim() }}</p>
        <p class="gift-title">Happy Diwali</p>
        <p class="gift-from">from {{ sender }}</p>
        <p class="diwali-wish">{{ activeWishText }}</p>
      </div>

      <div class="gift-actions send-preview-actions">
        <!-- Upgraded Share Component with WhatsApp & Copy -->
        <ShareButton
          :sender="sender"
          :recipient="recipient.trim() || undefined"
          :wish="activeWishText"
          :theme="selectedTheme"
        />

        <div class="preview-footer-buttons">
          <button class="quiet-button edit-btn" type="button" @click="preview = false">
            ← Edit Your Greeting
          </button>
          <NuxtLink class="quiet-button" to="/">
            Back to Home
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.send-eyebrow-badge,
.preview-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 200, 100, 0.15);
  border: 1px solid rgba(255, 215, 140, 0.3);
  color: #ffda82;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.form-group {
  margin-bottom: 20px;
}

.required-star {
  color: #ff8c72;
}

.optional-tag {
  color: rgba(255, 240, 220, 0.5);
  font-size: 12px;
  font-weight: 400;
}

.theme-selector-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.theme-card-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 6px;
  border: 1px solid rgba(255, 220, 160, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffecc5;
  cursor: pointer;
  transition: all 0.18s ease;
}

.theme-card-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 150, 0.4);
}

.theme-card-btn.is-selected {
  background: rgba(245, 145, 55, 0.25);
  border-color: #ffd880;
  box-shadow: 0 0 14px rgba(255, 180, 80, 0.3);
}

.theme-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.theme-card-icon {
  font-size: 16px;
}

.theme-card-label {
  font-size: 11px;
  font-weight: 600;
}

.wishes-preset-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-height: 175px;
  overflow-y: auto;
  padding-right: 4px;
}

.preset-wish-btn {
  padding: 8px 12px;
  border: 1px solid rgba(255, 220, 160, 0.16);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 245, 230, 0.85);
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
}

.preset-wish-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #fff9ed;
}

.preset-wish-btn.is-active {
  background: rgba(255, 180, 80, 0.2);
  border-color: #ffcf78;
  color: #ffffff;
  box-shadow: inset 0 0 12px rgba(255, 180, 80, 0.15);
}

.custom-wish-toggle {
  margin-top: 8px;
}

.toggle-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #ffcc77;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.custom-wish-textarea {
  margin-top: 8px;
  padding: 10px 14px;
  resize: vertical;
}

.preview-footer-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.gift-recipient {
  color: #ffe6aa;
  font-size: clamp(1.1rem, 2.5vw, 1.45rem);
  font-weight: 600;
  margin: 0 0 4px;
  letter-spacing: 0.03em;
  text-shadow: 0 0 16px rgba(255, 200, 100, 0.6);
}

.devanagari-accent {
  color: #ffdc88;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.15em;
  margin-bottom: 8px;
  text-shadow: 0 0 12px rgba(255, 180, 70, 0.5);
}
</style>

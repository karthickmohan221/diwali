<script setup lang="ts">
export type CrackerType = 'rocket' | 'chakri' | 'anar' | 'ladi' | 'sparkler' | 'lantern'
export type RangoliTheme = 'gold' | 'peacock' | 'kumkum'

const props = defineProps<{
  activeCracker: CrackerType
  aartiActive: boolean
  flowerShower: boolean
  theme: RangoliTheme
}>()

const emit = defineEmits<{
  'update:activeCracker': [value: CrackerType]
  'toggle-aarti': []
  'toggle-flower-shower': []
  'cycle-theme': []
}>()

const crackers: { id: CrackerType; label: string; icon: string; desc: string }[] = [
  { id: 'rocket', label: 'Rocket', icon: '🚀', desc: 'Tap sky to launch' },
  { id: 'chakri', label: 'Chakri', icon: '🌀', desc: 'Spinning ground wheel' },
  { id: 'anar', label: 'Anar', icon: '🌋', desc: 'Sparkling flowerpot fountain' },
  { id: 'ladi', label: 'Ladi', icon: '💥', desc: '1000-wala rapid garland' },
  { id: 'sparkler', label: 'Phuljhadi', icon: '🪄', desc: 'Move to sparkle' },
  { id: 'lantern', label: 'Lantern', icon: '🏮', desc: 'Floating sky lantern' },
]

const themeLabels: Record<RangoliTheme, string> = {
  gold: 'Lotus Gold 🪷',
  peacock: 'Peacock Emerald 🦚',
  kumkum: 'Festive Kumkum 🌸',
}
</script>

<template>
  <div class="cracker-toolbar-wrapper">
    <div class="cracker-bar" role="toolbar" aria-label="Diwali celebration controls">
      <button
        v-for="c in crackers"
        :key="c.id"
        type="button"
        class="cracker-tab"
        :class="{ 'is-active': activeCracker === c.id }"
        :title="c.desc"
        :aria-label="c.label"
        :aria-pressed="activeCracker === c.id"
        @click="emit('update:activeCracker', c.id)"
      >
        <span class="cracker-tab-icon" aria-hidden="true">{{ c.icon }}</span>
        <span class="cracker-tab-label">{{ c.label }}</span>
      </button>

      <button
        type="button"
        class="cracker-tab celebration-action-btn"
        :class="{ 'is-active': aartiActive }"
        :aria-pressed="aartiActive"
        title="Perform Sacred Aarti"
        @click="emit('toggle-aarti')"
      >
        <span aria-hidden="true">🪔</span>
        <span>{{ aartiActive ? 'Aarti In Motion' : 'Perform Aarti' }}</span>
      </button>

      <button
        type="button"
        class="cracker-tab celebration-action-btn"
        :class="{ 'is-active': flowerShower }"
        :aria-pressed="flowerShower"
        title="Toggle Marigold Flower Petal Rain"
        @click="emit('toggle-flower-shower')"
      >
        <span aria-hidden="true">🌸</span>
        <span>{{ flowerShower ? 'Petal Rain On' : 'Flower Shower' }}</span>
      </button>

      <button
        type="button"
        class="cracker-tab celebration-action-btn theme-btn"
        title="Switch Rangoli Theme"
        @click="emit('cycle-theme')"
      >
        <span aria-hidden="true">🎨</span>
        <span>{{ themeLabels[theme] }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cracker-toolbar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 580px;
  margin-inline: auto;
}

.cracker-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  border-radius: 999px;
  background: rgba(26, 17, 28, 0.72);
  border: 1px solid rgba(255, 215, 150, 0.24);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  overflow-x: auto;
  scrollbar-width: none;
}

.cracker-bar::-webkit-scrollbar {
  display: none;
}

.cracker-tab {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 240, 215, 0.85);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.cracker-tab-icon {
  font-size: 16px;
  line-height: 1;
}

.cracker-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff4dc;
}

.cracker-tab.is-active {
  background: linear-gradient(135deg, rgba(235, 140, 52, 0.95), rgba(184, 51, 42, 0.95));
  border-color: rgba(255, 226, 160, 0.65);
  color: #ffffff;
  box-shadow: 0 0 18px rgba(245, 145, 55, 0.45);
  transform: scale(1.04);
}

@media (max-width: 600px) {
  .cracker-tab {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>

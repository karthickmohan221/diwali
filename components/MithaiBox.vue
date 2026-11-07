<script setup lang="ts">
export interface Mithai {
  id: string
  name: string
  emoji: string
  blessing: string
  color: string
}

const props = defineProps<{
  sender: string
}>()

const mithais: Mithai[] = [
  {
    id: 'kaju-katli',
    name: 'Kaju Katli',
    emoji: '✨',
    blessing: 'May your life shine with royal purity, sweetness, and silver prosperity!',
    color: '#e0e0e0',
  },
  {
    id: 'motichoor-ladoo',
    name: 'Motichoor Ladoo',
    emoji: '🟡',
    blessing: 'May every tiny particle of your efforts turn into golden success and celebration!',
    color: '#f39c12',
  },
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun',
    emoji: '🍯',
    blessing: 'Warmth, love, and sweet nectar of happiness to you and your loved ones!',
    color: '#8b4513',
  },
  {
    id: 'besan-ladoo',
    name: 'Besan Ladoo',
    emoji: '🥮',
    blessing: 'Fragrant blessings of good health, peace of mind, and everlasting abundance!',
    color: '#f1c40f',
  },
  {
    id: 'jalebi',
    name: 'Crispy Jalebi',
    emoji: '🍥',
    blessing: 'May even the twists and turns in life lead you to sweet and joyful destinations!',
    color: '#e67e22',
  },
]

const selectedMithai = ref<Mithai | null>(null)
const isOpen = ref(false)

const pickMithai = (m: Mithai) => {
  selectedMithai.value = m
}
</script>

<template>
  <div class="mithai-container">
    <button
      class="mithai-toggle-btn"
      type="button"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="mithai-box-icon" aria-hidden="true">🎁</span>
      <span>{{ isOpen ? 'Close Mithai Box' : 'Open Diwali Sweets Box' }}</span>
      <span class="sparkle-tag" aria-hidden="true">from {{ sender }}</span>
    </button>

    <div v-if="isOpen" class="mithai-dabba" role="dialog" aria-label="Virtual Diwali Mithai Box">
      <div class="dabba-header">
        <span class="dabba-title">🪔 Shubh Deepavali Mithai Dabba 🪔</span>
        <p class="dabba-subtitle">Choose a festive sweet to reveal your personal blessing:</p>
      </div>

      <div class="mithai-grid">
        <button
          v-for="m in mithais"
          :key="m.id"
          type="button"
          class="mithai-card"
          :class="{ 'is-selected': selectedMithai?.id === m.id }"
          @click="pickMithai(m)"
        >
          <span class="mithai-emoji" aria-hidden="true">{{ m.emoji }}</span>
          <span class="mithai-name">{{ m.name }}</span>
        </button>
      </div>

      <div v-if="selectedMithai" class="blessing-card" aria-live="polite">
        <div class="blessing-badge">
          <span>✨ {{ selectedMithai.name }} Blessing ✨</span>
        </div>
        <p class="blessing-text">"{{ selectedMithai.blessing }}"</p>
        <span class="blessing-tagline">— Happy Diwali from {{ sender }} 🪔</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mithai-container {
  width: 100%;
  max-width: 480px;
  margin: 10px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.mithai-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(212, 143, 56, 0.25), rgba(168, 50, 75, 0.25));
  border: 1px solid rgba(255, 215, 140, 0.4);
  color: #fff1cf;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
}

.mithai-toggle-btn:hover {
  background: linear-gradient(135deg, rgba(230, 160, 70, 0.4), rgba(185, 60, 90, 0.4));
  border-color: #ffd880;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 180, 80, 0.35);
}

.sparkle-tag {
  font-size: 11px;
  font-weight: 500;
  color: #ffe6aa;
  opacity: 0.85;
}

.mithai-dabba {
  margin-top: 10px;
  width: 100%;
  padding: 16px;
  border-radius: 20px;
  background: rgba(30, 18, 32, 0.85);
  border: 1px solid rgba(255, 215, 150, 0.3);
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  animation: dabba-fade 0.25s ease-out;
}

@keyframes dabba-fade {
  from { opacity: 0; transform: scale(0.96) translateY(-6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.dabba-header {
  text-align: center;
  margin-bottom: 12px;
}

.dabba-title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #ffd77a;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.dabba-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255, 240, 220, 0.8);
}

.mithai-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.mithai-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 220, 160, 0.18);
  background: rgba(255, 255, 255, 0.05);
  color: #fff3dc;
  cursor: pointer;
  transition: all 0.18s ease;
}

.mithai-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 215, 140, 0.45);
  transform: translateY(-2px);
}

.mithai-card.is-selected {
  background: linear-gradient(135deg, rgba(235, 140, 52, 0.8), rgba(184, 51, 42, 0.8));
  border-color: #ffd77d;
  box-shadow: 0 0 16px rgba(255, 175, 70, 0.4);
  transform: scale(1.05);
}

.mithai-emoji {
  font-size: 20px;
}

.mithai-name {
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  line-height: 1.15;
}

.blessing-card {
  margin-top: 14px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(240, 150, 60, 0.15);
  border: 1px solid rgba(255, 215, 140, 0.35);
  text-align: center;
  animation: dabba-fade 0.2s ease-out;
}

.blessing-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #ffd885;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.blessing-text {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.45;
  font-style: italic;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

.blessing-tagline {
  font-size: 11px;
  font-weight: 600;
  color: #ffd885;
}

@media (max-width: 600px) {
  .mithai-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
  }
  .mithai-card {
    padding: 8px 2px;
  }
  .mithai-emoji {
    font-size: 18px;
  }
  .mithai-name {
    font-size: 9px;
  }
}
</style>

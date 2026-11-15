<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const store = useThemeStore()
const dark = computed(() => store.theme === 'dark')
</script>

<template>
  <!-- A toggle button: its name stays "Dark theme", and aria-pressed says whether it's on. -->
  <button type="button" class="theme-toggle" :aria-pressed="dark" @click="store.toggle()">
    <span class="visually-hidden">Dark theme</span>
    <!-- Both choices show, and the thumb sits behind the one in use. -->
    <span class="track" aria-hidden="true">
      <span class="thumb" :class="{ dark }" />
      <svg class="icon" :class="{ active: !dark }" viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
        />
      </svg>
      <svg class="icon" :class="{ active: dark }" viewBox="0 0 24 24" focusable="false">
        <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
/* The button is a full touch target; the switch drawn inside it is smaller and quieter. */
.theme-toggle {
  display: inline-grid;
  place-items: center;
  min-width: var(--target-min);
  min-height: var(--target-min);
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.track {
  position: relative;
  display: flex;
  gap: var(--space-1);
  padding: var(--space-1);
  border: var(--border-width) solid currentcolor;
  border-radius: var(--space-5);
}

.theme-toggle:hover .track {
  color: var(--color-text);
}

.thumb {
  position: absolute;
  top: var(--space-1);
  left: var(--space-1);
  width: var(--space-5);
  height: var(--space-5);
  border-radius: 50%;
  background: var(--color-text);
  transition: transform 150ms ease;
}

.thumb.dark {
  transform: translateX(calc(var(--space-5) + var(--space-1)));
}

.icon {
  position: relative;
  width: var(--space-5);
  height: var(--space-5);
  padding: var(--space-1);
  fill: none;
  stroke: currentcolor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* The icon in use sits on the thumb, so it takes the page colour. */
.icon.active {
  stroke: var(--color-surface);
}

@media (prefers-reduced-motion: reduce) {
  .thumb {
    transition: none;
  }
}
</style>

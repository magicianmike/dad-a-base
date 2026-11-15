<script setup lang="ts">
import { computed } from 'vue'
import type { Joke } from '@/api/schemas'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastsStore } from '@/stores/toasts'
import AppButton from './AppButton.vue'

const props = defineProps<{ joke: Joke }>()
const favorites = useFavoritesStore()
const toasts = useToastsStore()
const saved = computed(() => favorites.isFavorite(props.joke.id))

function toggle() {
  const outcome = favorites.toggle(props.joke)
  toasts.show(outcome === 'added' ? 'Saved to your favorites.' : 'Removed from your favorites.')
}
</script>

<template>
  <!-- A toggle button: its name stays "Favorite", and aria-pressed says whether it's saved. -->
  <AppButton :aria-pressed="saved" class="favorite" @click="toggle">
    <svg class="heart" :class="{ saved }" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
    Favorite
  </AppButton>
</template>

<style scoped>
.favorite {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
}

.heart {
  width: var(--space-4);
  height: var(--space-4);
  fill: none;
  stroke: currentcolor;
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.heart.saved {
  fill: var(--color-accent);
  stroke: var(--color-accent);
}
</style>

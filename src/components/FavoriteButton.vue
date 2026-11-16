<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Joke } from '@/api/schemas'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastsStore } from '@/stores/toasts'
import AppButton from './AppButton.vue'

const props = defineProps<{ joke: Joke }>()
const favorites = useFavoritesStore()
const toasts = useToastsStore()
const saved = computed(() => favorites.isFavorite(props.joke.id))

// The last press, which the heart animates: a pop and a burst of dots when saved, a shrink when taken off. Each
// press re-keys the heart, so pressing again replays it. Nothing plays on first render.
const pressed = ref<'added' | 'removed' | null>(null)
const presses = ref(0)

function toggle() {
  const outcome = favorites.toggle(props.joke)
  pressed.value = outcome
  presses.value++
  toasts.show(outcome === 'added' ? 'Saved to your favorites.' : 'Removed from your favorites.')
}
</script>

<template>
  <!-- Its label says whether the Joke is saved, so it isn't also a toggle (aria-pressed): a toggle's name must stay
  the same in both states, or a screen reader hears "Faved, selected". -->
  <AppButton class="favorite" @click="toggle">
    <span class="heart-box" aria-hidden="true">
      <svg
        :key="`heart-${presses}`"
        class="heart"
        :class="[{ saved }, pressed]"
        viewBox="0 0 24 24"
        focusable="false"
      >
        <!-- Two even lobes (circles at 8,9 and 16,9, radius 4.5) and straight sides tangent to them, meeting at a point. -->
        <path d="M12 20.5 4.6 11.95A4.5 4.5 0 1 1 12 6.94a4.5 4.5 0 1 1 7.4 5.01Z" />
      </svg>
      <span v-if="pressed === 'added'" :key="`burst-${presses}`" class="burst" />
    </span>
    {{ saved ? 'Faved' : 'Fave' }}
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

.heart-box {
  position: relative;
  display: inline-flex;
}

.heart.added {
  animation: heart-pop 450ms ease-out;
}

.heart.removed {
  animation: heart-shrink 300ms ease-out;
}

/* A ring of dots, like the Joke frame's halftone, bursting out from the heart. */
.burst {
  position: absolute;
  inset: calc(-1 * var(--space-2));
  border: var(--border-width-strong) dotted var(--color-accent);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  animation: burst 500ms ease-out;
}

@keyframes heart-pop {
  25% {
    transform: scale(0.7);
  }

  60% {
    transform: scale(1.35);
  }
}

@keyframes heart-shrink {
  40% {
    transform: scale(0.7);
  }
}

@keyframes burst {
  from {
    opacity: 1;
    transform: scale(0.4);
  }

  to {
    opacity: 0;
    transform: scale(1.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .heart.added,
  .heart.removed,
  .burst {
    animation: none;
  }
}
</style>

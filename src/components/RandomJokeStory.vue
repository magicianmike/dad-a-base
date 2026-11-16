<script setup lang="ts">
import { useRandomJoke } from '@/api/useRandomJoke'
import { useShortcut } from '@/shortcuts/useShortcut'
import { useMinimumBusy } from '@/useMinimumBusy'
import AppButton from './AppButton.vue'
import ErrorView from './ErrorView.vue'
import FavoriteButton from './FavoriteButton.vue'
import GroanButton from './GroanButton.vue'
import JokeCard from './JokeCard.vue'
import StoryHeading from './StoryHeading.vue'

/** A random Joke as a page's story, with "Another". Used by home and by /random. */
defineProps<{ kicker: string; headline: string; caption?: string }>()

const { joke, loading, error, next } = useRandomJoke()

/** "Another" stays busy for at least half a second, so a quick answer doesn't make it flicker. */
const busy = useMinimumBusy(loading, 500)

/** "Another", by button or by the `r` shortcut. Ignored while it's busy, as the button is. */
function another() {
  if (!busy.value) next()
}
useShortcut('r', another)
</script>

<template>
  <ErrorView v-if="error" :code="error.code" :on-retry="next" />
  <template v-else>
    <StoryHeading :kicker="kicker">{{ headline }}</StoryHeading>
    <div class="story" aria-live="polite" :aria-busy="loading">
      <!-- Keyed by the Joke, so each new one arrives with the page's fade up. -->
      <JokeCard
        v-if="joke"
        :key="joke.id"
        class="arrive"
        :joke="joke"
        :caption="caption"
        :to="`/jokes/${joke.id}`"
      />
      <p v-else>Loading a joke…</p>
    </div>
    <div class="actions">
      <AppButton variant="primary" class="another" :disabled="busy" @click="another">
        <!-- Two arrows chasing each other round: another one. -->
        <svg
          class="icon"
          :class="{ spinning: busy }"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M4.5 11A7.5 7.5 0 0 1 17.8 7.2L20 9.5M20 4v5.5h-5.5" />
          <path d="M19.5 13A7.5 7.5 0 0 1 6.2 16.8L4 14.5M4 20v-5.5h5.5" />
        </svg>
        Another
      </AppButton>
      <template v-if="joke">
        <FavoriteButton :joke="joke" />
        <!-- Keyed by the Joke, so a hold on one never carries over to the next. -->
        <GroanButton :key="joke.id" :joke="joke" />
      </template>
    </div>
  </template>
</template>

<style scoped>
.story {
  max-width: var(--measure-reading);
  margin-bottom: var(--space-5);
}

.another {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
}

.icon {
  width: var(--space-4);
  height: var(--space-4);
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.5;
}

/* The arrows chase each other round while the next Joke loads. */
.spinning {
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinning {
    animation: none;
  }
}

.arrive {
  animation: arrive 250ms ease-out;
}

@keyframes arrive {
  from {
    opacity: 0;
    translate: 0 var(--space-3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .arrive {
    animation: none;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  align-items: center;
}

/*
 * Groan keeps room for its widest "Ughhh…!", so it shares the line when that fits and wraps to its own when it
 * doesn't, and never moves while it's held. On a line too narrow even for that, it shrinks rather than overflows.
 */
.actions > .groan {
  flex: 1 1 var(--groan-room);
  justify-content: flex-start;
  min-width: 0;
}
</style>

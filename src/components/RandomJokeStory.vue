<script setup lang="ts">
import { useRandomJoke } from '@/api/useRandomJoke'
import AppButton from './AppButton.vue'
import ErrorView from './ErrorView.vue'
import FavoriteButton from './FavoriteButton.vue'
import JokeCard from './JokeCard.vue'
import StoryHeading from './StoryHeading.vue'

/** A random Joke as a page's story, with "Another one". Used by home and by /random. */
defineProps<{ kicker: string; headline: string; caption?: string }>()

const { joke, loading, error, next } = useRandomJoke()
</script>

<template>
  <ErrorView v-if="error" :code="error.code" :on-retry="next" />
  <template v-else>
    <StoryHeading :kicker="kicker">{{ headline }}</StoryHeading>
    <div class="story" aria-live="polite" :aria-busy="loading">
      <JokeCard v-if="joke" :joke="joke" :caption="caption" :to="`/jokes/${joke.id}`" />
      <p v-else>Loading a joke…</p>
    </div>
    <div class="actions">
      <AppButton variant="primary" :disabled="loading" @click="next">Another one</AppButton>
      <FavoriteButton v-if="joke" :joke="joke" />
    </div>
  </template>
</template>

<style scoped>
.story {
  max-width: var(--measure-reading);
  margin-bottom: var(--space-5);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  align-items: center;
}
</style>

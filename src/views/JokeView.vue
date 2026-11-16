<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, useTemplateRef } from 'vue'
import { useJoke } from '@/api/useJoke'
import CopyButton from '@/components/CopyButton.vue'
import ErrorView from '@/components/ErrorView.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import JokeCard from '@/components/JokeCard.vue'
import ShareButton from '@/components/ShareButton.vue'
import StoryHeading from '@/components/StoryHeading.vue'

const props = defineProps<{ id: string }>()

const { joke, loading, error, retry } = useJoke(() => props.id)
const card = useTemplateRef<InstanceType<typeof JokeCard>>('card')

/** The Joke's opening words, as the page title, cut at a whole word. */
const title = computed(() => {
  const text = joke.value?.joke
  if (!text) return 'A joke'
  if (text.length <= 60) return text
  const cut = text.slice(0, 58)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:]+$/, '')}…`
})
useHead({ title })
</script>

<template>
  <ErrorView v-if="error" :code="error.code" :on-retry="retry" />
  <template v-else>
    <StoryHeading kicker="From the archives">A joke, reprinted</StoryHeading>
    <div class="story" aria-live="polite" :aria-busy="loading">
      <template v-if="joke">
        <JokeCard
          ref="card"
          :joke="joke"
          caption="Reprinted with permission of every dad, everywhere."
        />
        <div class="actions">
          <CopyButton
            :text="joke.joke"
            :fallback-target="() => card?.$el.querySelector('blockquote') ?? null"
          />
          <ShareButton :joke="joke" />
          <FavoriteButton :joke="joke" />
        </div>
      </template>
      <p v-else>Fetching the joke from the archives…</p>
    </div>
    <RouterLink to="/random" class="more">Another random joke</RouterLink>
  </template>
</template>

<style scoped>
.story {
  max-width: var(--measure-reading);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-block: var(--space-5) var(--space-6);
}

.more {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  font-weight: 700;
}
</style>

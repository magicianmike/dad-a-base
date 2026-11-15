<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRandomJoke } from '@/api/useRandomJoke'
import AppButton from '@/components/AppButton.vue'
import ErrorView from '@/components/ErrorView.vue'
import JokeCard from '@/components/JokeCard.vue'
import StoryHeading from '@/components/StoryHeading.vue'

useHead({ title: 'A random joke' })

const { joke, loading, error, next } = useRandomJoke()
</script>

<template>
  <ErrorView v-if="error" :code="error.code" :on-retry="next" />
  <template v-else>
    <StoryHeading kicker="Hot off the press">A random joke</StoryHeading>
    <div class="story" aria-live="polite" :aria-busy="loading">
      <JokeCard v-if="joke" :joke="joke" />
      <p v-else>Loading a joke…</p>
    </div>
    <AppButton variant="primary" :disabled="loading" @click="next">Another one</AppButton>
  </template>
</template>

<style scoped>
.story {
  max-width: var(--measure-reading);
  margin-bottom: var(--space-5);
}
</style>

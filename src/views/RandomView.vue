<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRandomJoke } from '@/api/useRandomJoke'
import AppButton from '@/components/AppButton.vue'
import JokeCard from '@/components/JokeCard.vue'
import StoryHeading from '@/components/StoryHeading.vue'

useHead({ title: 'A random joke' })

const { joke, loading, error, next } = useRandomJoke()
</script>

<template>
  <StoryHeading kicker="Hot off the press">A random joke</StoryHeading>
  <div class="story" aria-live="polite" :aria-busy="loading">
    <p v-if="error" role="alert">Couldn't fetch a joke ({{ error.code }}).</p>
    <JokeCard v-else-if="joke" :joke="joke" />
    <p v-else>Loading a joke…</p>
  </div>
  <AppButton variant="primary" :disabled="loading" @click="next">Another one</AppButton>
</template>

<style scoped>
.story {
  max-width: var(--measure-reading);
  margin-bottom: var(--space-5);
}
</style>

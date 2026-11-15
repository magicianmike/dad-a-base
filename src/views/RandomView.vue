<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRandomJoke } from '@/api/useRandomJoke'
import JokeCard from '@/components/JokeCard.vue'

useHead({ title: 'A random joke' })

const { joke, loading, error, next } = useRandomJoke()
</script>

<template>
  <h1>A random joke</h1>
  <div aria-live="polite" :aria-busy="loading">
    <p v-if="error" role="alert">Couldn't fetch a joke ({{ error.code }}).</p>
    <JokeCard v-else-if="joke" :joke="joke" />
    <p v-else>Loading a joke…</p>
  </div>
  <button type="button" :disabled="loading" @click="next">Another one</button>
</template>

<script setup lang="ts">
import type { Joke } from '@/api/schemas'

defineProps<{ joke: Joke }>()
</script>

<template>
  <figure class="joke-card">
    <blockquote class="joke-text">{{ joke.joke }}</blockquote>
  </figure>
</template>

<style scoped>
.joke-card {
  margin: 0;
  padding: var(--space-6);
  background: var(--joke-card-bg);
  border-radius: var(--space-2);
}

.joke-text {
  margin: 0;
  font-size: var(--joke-text-size);
}
</style>

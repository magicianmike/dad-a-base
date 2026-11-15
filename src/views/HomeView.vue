<script setup lang="ts">
import { useHead } from '@unhead/vue'
import StoryHeading from '@/components/StoryHeading.vue'

useHead({ title: '' })
</script>

<template>
  <StoryHeading kicker="Today's top story">Local dad says the thing again</StoryHeading>
  <p>All the jokes that are fit to groan.</p>
  <RouterLink to="/random">Get a random joke</RouterLink>
</template>

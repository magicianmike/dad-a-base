<script setup lang="ts">
import { useHead } from '@unhead/vue'
import RandomJokeStory from '@/components/RandomJokeStory.vue'

useHead({ title: '' })
</script>

<template>
  <RandomJokeStory
    kicker="Today's top story"
    headline="Local dad says the thing again"
    caption="Witnesses report groaning."
  />
</template>

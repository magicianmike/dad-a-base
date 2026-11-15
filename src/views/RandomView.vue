<script setup lang="ts">
import { useHead } from '@unhead/vue'
import RandomJokeStory from '@/components/RandomJokeStory.vue'

useHead({ title: 'A random joke' })
</script>

<template>
  <RandomJokeStory kicker="Hot off the press" headline="A random joke" />
</template>

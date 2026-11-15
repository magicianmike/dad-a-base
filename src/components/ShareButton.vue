<script setup lang="ts">
import type { Joke } from '@/api/schemas'
import { shareJoke } from '@/composables/useJokeSharing'
import { useToastsStore } from '@/stores/toasts'
import AppButton from './AppButton.vue'

const props = defineProps<{ joke: Joke }>()
const toasts = useToastsStore()

async function share() {
  const url = new URL(`/jokes/${props.joke.id}`, location.origin).href
  const outcome = await shareJoke(props.joke, url)
  if (outcome === 'copied-link') toasts.show('Copied the link to this joke.')
  if (outcome === 'failed')
    toasts.show("Couldn't share or copy the link. Copy it from the address bar.")
}
</script>

<template>
  <AppButton @click="share">Share</AppButton>
</template>

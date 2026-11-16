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
  <AppButton class="share" @click="share">
    <!-- An arrow rising out of a tray, sending the Joke on. -->
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13M12 15V4M7.5 8.5 12 4l4.5 4.5"
      />
    </svg>
    Share
  </AppButton>
</template>

<style scoped>
.share {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
}

.icon {
  width: var(--space-4);
  height: var(--space-4);
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.5;
}
</style>

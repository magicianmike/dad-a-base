<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { copyShortcut, copyText, selectText } from '@/composables/useJokeSharing'
import { useToastsStore } from '@/stores/toasts'
import AppButton from './AppButton.vue'

const props = defineProps<{
  text: string
  /** The element holding the text, selected for the visitor to copy by hand if copying fails. */
  fallbackTarget: () => Element | null
}>()

const toasts = useToastsStore()
const copied = ref(false)
let reset: ReturnType<typeof setTimeout> | undefined

async function copy() {
  if (await copyText(props.text)) {
    copied.value = true
    clearTimeout(reset)
    reset = setTimeout(() => (copied.value = false), 2000)
    toasts.show('Copied the joke.')
    return
  }
  const target = props.fallbackTarget()
  if (target) selectText(target)
  toasts.show(
    `Couldn't copy automatically. The joke is selected: press ${copyShortcut()} to copy it.`,
  )
}

onBeforeUnmount(() => clearTimeout(reset))
</script>

<template>
  <AppButton variant="primary" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</AppButton>
</template>

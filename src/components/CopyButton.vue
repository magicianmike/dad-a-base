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
  <AppButton variant="primary" class="copy" @click="copy">
    <!-- Two sheets, one copied from the other, then a tick once it's done. -->
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path v-if="copied" d="M5 12.5l4.5 4.5L19 7.5" />
      <template v-else>
        <rect x="9" y="9" width="11" height="11" rx="1.5" />
        <path d="M15 9V5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15H9" />
      </template>
    </svg>
    {{ copied ? 'Copied' : 'Copy' }}
  </AppButton>
</template>

<style scoped>
.copy {
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

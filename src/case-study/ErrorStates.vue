<script setup lang="ts">
import { ref } from 'vue'
import type { ErrorCode } from '@/api/errors'
import ErrorView from '@/components/ErrorView.vue'
import { useToastsStore } from '@/stores/toasts'
import LiveFigure from './LiveFigure.vue'
import StatePicker from './StatePicker.vue'

/** Every Error state, one at a time, as the app shows it. */
const codes = [
  { value: '404', label: '404' },
  { value: '403', label: '403' },
  { value: '429', label: '429' },
  { value: '500', label: '500' },
  { value: 'offline', label: 'Offline' },
  { value: 'unknown', label: 'Unknown' },
] as const satisfies readonly { value: ErrorCode; label: string }[]

const code = ref<ErrorCode>('429')
const toasts = useToastsStore()
const retry = () => toasts.show('In the app, this asks the joke service again.')
</script>

<template>
  <LiveFigure
    caption="ErrorView, with its code given as a prop. Its headline sits at this page's level here."
  >
    <StatePicker v-model="code" legend="Show the Error state for" :options="codes" />
    <ErrorView :code="code" :level="3" :on-retry="retry" />
  </LiveFigure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { errorCodes, type ErrorCode } from '@/api/errors'
import ErrorView from '@/components/ErrorView.vue'

/** `/error/:code` and the catch-all. An unknown code is itself a page that doesn't exist. */
const props = defineProps<{ code?: string }>()

const errorCode = computed<ErrorCode>(() =>
  errorCodes.includes(props.code as ErrorCode) ? (props.code as ErrorCode) : '404',
)

// Linked error pages can't retry anything, so "Try again" reloads.
const retry = () => location.reload()
</script>

<template>
  <ErrorView :key="errorCode" :code="errorCode" :on-retry="retry" />
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import type { ErrorCode } from '@/api/errors'
import { errorCopy } from '@/errors/copy'
import AppButton from './AppButton.vue'

const props = defineProps<{
  code: ErrorCode
  /** Given, and the error is one that trying again could fix, a "Try again" button calls it. */
  onRetry?: () => void
}>()

const copy = errorCopy[props.code]
useHead({ title: copy.title })
</script>

<template>
  <article class="correction" aria-labelledby="error-headline">
    <p class="kicker">
      {{ copy.kicker }}
      <span class="code"
        >· {{ code === 'offline' || code === 'unknown' ? copy.title : `Error ${code}` }}</span
      >
    </p>
    <h1 id="error-headline">{{ copy.headline }}</h1>
    <p class="explanation">{{ copy.explanation }}</p>
    <div class="actions">
      <AppButton v-if="copy.retryable && onRetry" variant="primary" @click="onRetry"
        >Try again</AppButton
      >
      <RouterLink to="/" class="action">Front page</RouterLink>
      <RouterLink to="/random" class="action">A random joke</RouterLink>
    </div>
    <p class="regrets">The Dad-a-base regrets the error.</p>
  </article>
</template>

<style scoped>
.correction {
  max-width: var(--measure-reading);
  margin: var(--space-4) auto;
  padding: var(--space-6);
  border: var(--joke-frame-border);
  background: var(--color-surface-raised);
  box-shadow: var(--correction-shadow);
}

.kicker {
  margin: 0 0 var(--space-2);
  color: var(--kicker-color);
  font-family: var(--kicker-font);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.code {
  color: var(--color-text-muted);
}

.explanation {
  font-size: var(--text-lg);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-5);
  align-items: center;
  margin-top: var(--space-5);
}

.action {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  font-weight: 700;
}

.regrets {
  margin: var(--space-5) 0 0;
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-style: italic;
  font-weight: 700;
}
</style>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, useId } from 'vue'
import type { ErrorCode } from '@/api/errors'
import { errorCopy } from '@/errors/copy'
import AppButton from './AppButton.vue'

const props = withDefaults(
  defineProps<{
    code: ErrorCode
    /** Given, and the error is one that trying again could fix, a "Try again" button calls it. */
    onRetry?: () => void
    /**
     * Its headline's level. At 1, the default, it's the page, and titles it. Shown inside another page, such as the
     * Case Study, it's a lower heading and leaves the title alone.
     */
    level?: 1 | 2 | 3 | 4
  }>(),
  { onRetry: undefined, level: 1 },
)

const copy = computed(() => errorCopy[props.code])
const headlineId = useId()
useHead(computed(() => (props.level === 1 ? { title: copy.value.title } : {})))
</script>

<template>
  <article class="correction" :aria-labelledby="headlineId">
    <p class="kicker">
      {{ copy.kicker }}
      <span class="code"
        >· {{ code === 'offline' || code === 'unknown' ? copy.title : `Error ${code}` }}</span
      >
    </p>
    <component :is="`h${level}`" :id="headlineId" class="headline">{{ copy.headline }}</component>
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
/* The notice looks the same at any heading level: a front-page headline. */
.headline {
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: 0.01em;
}

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

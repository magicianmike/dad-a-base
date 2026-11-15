<script setup lang="ts">
import { useToastsStore } from '@/stores/toasts'

const store = useToastsStore()
</script>

<template>
  <!-- Always in the page, so screen readers are already listening when a toast arrives. -->
  <div class="toast-region" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <p v-for="toast in store.toasts" :key="toast.id" class="toast">
        <span>{{ toast.message }}</span>
        <button type="button" class="dismiss" @click="store.dismiss(toast.id)">
          <span aria-hidden="true">×</span>
          <span class="visually-hidden">Dismiss</span>
        </button>
      </p>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-region {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  left: var(--space-4);
  z-index: 10;
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  pointer-events: none;
}

.toast {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  max-width: var(--measure-reading);
  margin: 0;
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
  border: var(--border-width-strong) solid var(--color-border);
  background: var(--color-text);
  color: var(--color-surface);
  box-shadow: var(--button-shadow);
  font-weight: 700;
  pointer-events: auto;
}

.dismiss {
  display: inline-grid;
  place-items: center;
  min-width: var(--target-min);
  min-height: var(--target-min);
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: var(--text-xl);
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--space-3)));
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>

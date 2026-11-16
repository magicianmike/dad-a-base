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
  gap: var(--space-1);
  align-items: center;
  max-width: var(--measure-reading);
  margin: 0;
  padding: 0 0 0 var(--space-3);
  background: var(--toast-bg);
  color: var(--toast-text);
  font-size: var(--text-sm);
  font-weight: 700;
  pointer-events: auto;

  /* Blurs what scrolls behind it, so the text stays easy to read. */
  backdrop-filter: blur(var(--space-1));
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
  font-size: var(--text-lg);
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

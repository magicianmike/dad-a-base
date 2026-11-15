<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary'; type?: 'button' | 'submit' }>(), {
  variant: 'secondary',
  type: 'button',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button :type="type" class="button" :class="variant" @click="emit('click', $event)">
    <slot />
  </button>
</template>

<style scoped>
.button {
  min-height: var(--target-min);
  padding: var(--space-2) var(--space-4);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  box-shadow: var(--button-shadow);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.button:active {
  box-shadow: none;
  transform: translate(var(--shadow-offset), var(--shadow-offset));
}

.primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}

@media (prefers-reduced-motion: reduce) {
  .button:active {
    transform: none;
  }
}
</style>

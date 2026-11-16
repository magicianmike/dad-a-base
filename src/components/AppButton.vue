<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'secondary', type: 'button', disabled: false },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

/**
 * A disabled button ignores presses but keeps its focus, so a keyboard user who presses it isn't sent back to the
 * top of the page, as the `disabled` attribute would. `aria-disabled` tells a screen reader it's unavailable.
 */
function press(event: MouseEvent) {
  if (props.disabled) event.preventDefault()
  else emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    class="button"
    :class="variant"
    :aria-disabled="disabled || undefined"
    @click="press"
  >
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

.button:active:not([aria-disabled='true']) {
  box-shadow: none;
  transform: translate(var(--shadow-offset), var(--shadow-offset));
}

.button[aria-disabled='true'] {
  opacity: 0.7;
  cursor: progress;
}

.primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}

@media (prefers-reduced-motion: reduce) {
  .button:active:not([aria-disabled='true']) {
    transform: none;
  }
}
</style>

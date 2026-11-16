<script setup lang="ts">
import { onScopeDispose, ref } from 'vue'

/**
 * The round button, a broken heart, that takes a Joke off the Favorites page. Its tooltip is also its name, so it's
 * always in the accessibility tree. It shows on hover and keyboard focus, stays while the pointer is over it, and
 * Escape hides it until the pointer or focus comes back (WCAG 1.4.13).
 */
const emit = defineEmits<{ click: [] }>()
const dismissed = ref(false)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') dismissed.value = true
}
addEventListener('keydown', onKeydown)
onScopeDispose(() => removeEventListener('keydown', onKeydown))
</script>

<template>
  <button
    type="button"
    class="remove"
    :class="{ dismissed }"
    @click="emit('click')"
    @pointerenter="dismissed = false"
    @focus="dismissed = false"
  >
    <!-- FavoriteButton's heart, cracked from the dip to the tip, its halves pulled apart. -->
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20.5 4.6 11.95A4.5 4.5 0 1 1 12 6.94l-1.2 3.66 2.2 2.4-1.6 3.4Z"
        transform="translate(-1.25 0)"
      />
      <path
        d="M12 6.94a4.5 4.5 0 1 1 7.4 5.01L12 20.5l-.6-4.1 1.6-3.4-2.2-2.4Z"
        transform="translate(1.25 0)"
      />
    </svg>
    <!-- Pressing the tooltip itself mustn't remove the Joke. -->
    <span class="tip" @click.stop>Remove from favorites</span>
  </button>
</template>

<style scoped>
/* A round magnet holding the clipping to the fridge. */
.remove {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--target-min);
  height: var(--target-min);
  padding: 0;
  border: var(--border-width) solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface-raised);
  color: var(--color-text);
  box-shadow: var(--button-shadow);
  font: inherit;
  cursor: pointer;
}

.remove:hover {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}

.remove:active {
  box-shadow: none;
  transform: translate(var(--shadow-offset), var(--shadow-offset));
}

/* Solid, in the saved heart's red. A thin stroke of the same colour softens its corners. */
svg {
  width: var(--space-5);
  height: var(--space-5);
  color: var(--color-accent);
  fill: currentcolor;
  stroke: currentcolor;
  stroke-linejoin: round;
  stroke-width: 1;
}

.remove:hover svg {
  color: var(--button-primary-text);
}

/* Centred above the button. */
.tip {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  left: 50%;
  translate: -50% 0;
  padding: var(--space-1) var(--space-3);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-text);
  color: var(--color-surface);
  box-shadow: var(--button-shadow);
  font-size: var(--text-sm);
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  cursor: default;
  transition: opacity 150ms ease;
}

/* Bridges the gap, so the pointer can move onto the tooltip without it going. */
.tip::after {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  height: var(--space-2);
  content: '';
}

.remove:is(:hover, :focus-visible):not(.dismissed) .tip {
  opacity: 1;
  pointer-events: auto;
}

/* Where the card reaches the screen's edge, a centred tooltip would run off it, so its right edge lines up with the
   button's instead. */
@media (width < 50rem) {
  .tip {
    right: 0;
    left: auto;
    translate: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .remove:active {
    transform: none;
  }

  .tip {
    transition: none;
  }
}
</style>

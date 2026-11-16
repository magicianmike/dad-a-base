<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Joke } from '@/api/schemas'
import { useFavoritesStore } from '@/stores/favorites'

/**
 * A Joke in its comic frame. Given `to`, the whole frame links there, named by the Joke's text. A Favorite wears a
 * heart on the frame's top-right corner. The `corner` slot pins a control there instead, above the link.
 */
const props = withDefaults(
  defineProps<{ joke: Joke; caption?: string; to?: RouteLocationRaw; compact?: boolean }>(),
  { caption: undefined, to: undefined, compact: false },
)

const favorites = useFavoritesStore()
const saved = computed(() => favorites.isFavorite(props.joke.id))
</script>

<template>
  <figure class="joke-card" :class="{ compact }">
    <div class="frame">
      <blockquote class="joke-text">
        <p>
          <RouterLink v-if="to" :to="to" class="joke-link">{{ joke.joke }}</RouterLink>
          <template v-else>{{ joke.joke }}</template>
        </p>
      </blockquote>
      <div v-if="$slots.corner" class="corner"><slot name="corner" /></div>
      <Transition v-else name="mark">
        <span v-if="saved" class="saved-mark" role="img" aria-label="One of your favorites">
          <!-- FavoriteButton's heart. -->
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 20.5 4.6 11.95A4.5 4.5 0 1 1 12 6.94a4.5 4.5 0 1 1 7.4 5.01Z" />
          </svg>
        </span>
      </Transition>
    </div>
    <figcaption v-if="caption" class="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.joke-card {
  margin: 0;
}

.frame {
  position: relative;
  padding: var(--space-7) var(--space-6);
  border: var(--joke-frame-border);

  /* Drawn from a registered colour, below, so hovering can fade the dots from one colour to another. */
  --joke-frame-dot-color: var(--joke-frame-dots);

  background-color: var(--joke-frame-bg);
  background-image: radial-gradient(
    var(--joke-frame-dot-color) var(--joke-frame-dot-size),
    transparent var(--joke-frame-dot-edge)
  );
  background-size: var(--joke-frame-halftone-pitch) var(--joke-frame-halftone-pitch);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    --joke-frame-dot-color 300ms ease;
}

@property --joke-frame-dot-color {
  syntax: '<color>';
  inherits: false;
  initial-value: transparent;
}

.compact .frame {
  padding: var(--space-5);
}

/* Clear of the corner's control, which straddles the border. */
.frame:has(.corner) {
  padding-right: calc(var(--target-min) + var(--space-2));
}

.corner {
  position: absolute;
  z-index: 1;
  top: calc(-1 * var(--space-3));
  right: calc(-1 * var(--space-3));
}

.joke-text {
  margin: 0;
}

/* Each line gets its own paper backing, so the dots never sit behind the text. */
.joke-text p {
  display: inline;
  margin: 0;
  padding: var(--space-1) var(--space-2);
  background: var(--joke-frame-bg);
  font-size: var(--joke-text-size);
  font-weight: 700;
  line-height: 1.5;
  box-decoration-break: clone;
}

.compact .joke-text p {
  font-size: var(--joke-text-size-compact);
}

.joke-link {
  text-decoration: none;
}

/* The whole frame is the link's target, and shows its focus ring. */
.joke-link::after {
  position: absolute;
  inset: 0;
  content: '';
}

.joke-link:focus-visible {
  outline: none;
}

.frame:has(.joke-link:focus-visible) {
  outline: var(--focus-ring-width) solid var(--color-focus);
  outline-offset: var(--focus-ring-width);
}

/* Hovered, a linked panel lifts off the page and its dots drift. */
.frame:has(.joke-link:hover) {
  --joke-frame-dot-color: var(--joke-frame-dots-hover);

  box-shadow: var(--joke-frame-hover-shadow);
  transform: translate(calc(-1 * var(--shadow-offset)), calc(-1 * var(--shadow-offset)));
  animation: halftone-drift var(--joke-frame-drift-duration) linear infinite;
}

@keyframes halftone-drift {
  to {
    background-position: var(--joke-frame-halftone-pitch) var(--joke-frame-halftone-pitch);
  }
}

@media (prefers-reduced-motion: reduce) {
  .frame {
    transition: none;
  }

  .frame:has(.joke-link:hover) {
    transform: none;
    animation: none;
  }
}

/*
 * A Favorite's heart, straddling the corner like the Favorites page's Remove button, but smaller and inside the
 * frame's padding, so it never covers the Joke. Clicks pass through it to the card's link.
 */
.saved-mark {
  position: absolute;
  z-index: 1;
  top: calc(-1 * var(--space-4));
  right: calc(-1 * var(--space-4));
  display: grid;
  place-items: center;
  width: var(--space-7);
  height: var(--space-7);
  border: var(--border-width) solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface-raised);
  box-shadow: var(--button-shadow);
  pointer-events: none;
}

.saved-mark svg {
  width: var(--space-5);
  height: var(--space-5);
  fill: var(--color-accent);
  stroke: var(--color-accent);
  stroke-linejoin: round;
  stroke-width: 1;
}

/* It pops on when the Joke is saved, and fades when it's taken off. */
.mark-enter-active {
  animation: mark-pop 400ms ease-out;
}

.mark-leave-active {
  transition:
    opacity 200ms ease-in,
    scale 200ms ease-in;
}

.mark-leave-to {
  opacity: 0;
  scale: 0.5;
}

@keyframes mark-pop {
  0% {
    scale: 0;
  }

  60% {
    scale: 1.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mark-enter-active {
    animation: none;
  }

  .mark-leave-active {
    transition: none;
  }
}

.caption {
  margin-top: var(--space-2);
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-style: italic;
  font-weight: 700;
}
</style>

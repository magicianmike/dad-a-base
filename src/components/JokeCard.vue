<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { Joke } from '@/api/schemas'

/** A Joke in its comic frame. Given `to`, the whole frame links there, named by the Joke's text. */
withDefaults(
  defineProps<{ joke: Joke; caption?: string; to?: RouteLocationRaw; compact?: boolean }>(),
  { caption: undefined, to: undefined, compact: false },
)
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
  background: var(--joke-frame-bg) var(--joke-frame-halftone);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;
}

.compact .frame {
  padding: var(--space-5);
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

.caption {
  margin-top: var(--space-2);
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-style: italic;
  font-weight: 700;
}
</style>

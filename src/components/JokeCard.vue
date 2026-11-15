<script setup lang="ts">
import type { Joke } from '@/api/schemas'

withDefaults(defineProps<{ joke: Joke; caption?: string }>(), { caption: undefined })
</script>

<template>
  <figure class="joke-card">
    <div class="frame">
      <blockquote class="joke-text">
        <p>{{ joke.joke }}</p>
      </blockquote>
    </div>
    <figcaption class="caption">{{ caption ?? `Joke #${joke.id}` }}</figcaption>
  </figure>
</template>

<style scoped>
.joke-card {
  margin: 0;
}

.frame {
  padding: var(--space-7) var(--space-6);
  border: var(--joke-frame-border);
  background: var(--joke-frame-bg) var(--joke-frame-halftone);
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

.caption {
  margin-top: var(--space-2);
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-style: italic;
  font-weight: 700;
}
</style>

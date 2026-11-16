<script setup lang="ts">
/** A live app component in the Case Study, tagged as live, not a picture of one, with a caption. */
defineProps<{ caption: string }>()
</script>

<template>
  <figure class="live">
    <p class="tag" aria-hidden="true">Live</p>
    <div class="stage"><slot /></div>
    <figcaption class="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.live {
  position: relative;
  margin: var(--space-6) 0;
  padding: var(--space-5);
  border: var(--border-width) dashed var(--color-border);
}

.tag {
  position: absolute;
  top: calc(-1 * var(--space-3));
  left: var(--space-4);
  margin: 0;
  padding: 0 var(--space-2);
  background: var(--color-surface);
  color: var(--kicker-color);
  font-family: var(--kicker-font);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stage > :deep(*:first-child) {
  margin-top: 0;
}

.caption {
  margin-top: var(--space-4);
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-style: italic;
}
</style>

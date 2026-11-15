<script setup lang="ts">
/** Renders its slot twice, light and dark, side by side. The theme doesn't depend on the page's. */
const themes = ['light', 'dark'] as const
</script>

<template>
  <div class="spread">
    <div v-for="theme in themes" :key="theme" :data-theme="theme" class="side">
      <p class="label">{{ theme === 'light' ? 'Light' : 'Dark' }}</p>
      <slot :theme="theme" />
    </div>
  </div>
</template>

<style scoped>
.spread {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  border: var(--border-width) solid var(--color-border);
}

.side {
  min-width: 0;
  padding: var(--space-5);
  background: var(--color-surface);
  color: var(--color-text);
}

.label {
  margin: 0 0 var(--space-3);
  color: var(--kicker-color);
  font-family: var(--kicker-font);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>

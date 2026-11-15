<script setup lang="ts">
defineProps<{ kicker: string }>()
</script>

<template>
  <hgroup class="story-heading">
    <p class="kicker">{{ kicker }}</p>
    <h1><slot /></h1>
  </hgroup>
</template>

<style scoped>
.story-heading {
  margin-bottom: var(--space-5);
}

.kicker {
  margin: 0 0 var(--space-2);
  color: var(--kicker-color);
  font-family: var(--kicker-font);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
}
</style>

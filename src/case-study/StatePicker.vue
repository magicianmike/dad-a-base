<script setup lang="ts" generic="T extends string | number">
import { useId } from 'vue'

/** A row of choices that sets which fixed state a live component shows. A radio group, so arrow keys move it. */
defineProps<{ legend: string; options: readonly { value: T; label: string }[] }>()
const chosen = defineModel<T>({ required: true })
const name = useId()
</script>

<template>
  <fieldset class="picker">
    <legend class="legend">{{ legend }}</legend>
    <label v-for="option in options" :key="option.value" class="option">
      <input v-model="chosen" type="radio" :name="name" :value="option.value" />
      {{ option.label }}
    </label>
  </fieldset>
</template>

<style scoped>
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  margin: 0 0 var(--space-5);
  padding: 0;
  border: 0;
}

.legend {
  width: 100%;
  margin-bottom: var(--space-2);
  padding: 0;
  font-weight: 700;
}

.option {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  min-height: var(--target-min);
  padding: 0 var(--space-3);
  border: var(--border-width) solid var(--color-border);
  cursor: pointer;
}

.option:has(:checked) {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}

.option:has(:focus-visible) {
  outline: var(--focus-ring-width) solid var(--color-focus);
  outline-offset: var(--focus-ring-width);
}

.option input {
  accent-color: var(--color-accent);
}
</style>

<script setup lang="ts">
import { useId, useTemplateRef } from 'vue'
import { useShortcut } from '@/shortcuts/useShortcut'
import AppButton from './AppButton.vue'

/** A labelled search field with a Search button, drawn as a magnifier. Pressing Enter or the button emits `submit`. */
withDefaults(defineProps<{ label?: string }>(), { label: 'Search the jokes' })
const term = defineModel<string>({ default: '' })
const emit = defineEmits<{ submit: [term: string] }>()
const id = useId()

// The `/` shortcut comes here, wherever there's a search box on the page.
const input = useTemplateRef<HTMLInputElement>('input')
useShortcut('/', () => input.value?.focus())
</script>

<template>
  <form role="search" class="search-box" @submit.prevent="emit('submit', term)">
    <label :for="id" class="label">{{ label }}</label>
    <div class="row">
      <input
        :id="id"
        ref="input"
        v-model="term"
        type="search"
        name="q"
        class="input"
        autocomplete="off"
        enterkeyhint="search"
      />
      <!-- A magnifier, so the field gets the width. Its name stays "Search" for screen readers. -->
      <AppButton type="submit" variant="primary" class="submit">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 20 20" />
        </svg>
        <span class="visually-hidden">Search</span>
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 700;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.input {
  flex: 1 1 12rem;
  min-width: 0;
  min-height: var(--target-min);
  padding: var(--space-2) var(--space-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: 0;
  background: var(--color-surface-raised);
  color: var(--color-text);
  font: inherit;
}

.submit {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: var(--target-min);
  padding: var(--space-2);
}

.icon {
  width: var(--space-5);
  height: var(--space-5);
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-width: 2.75;
}
</style>

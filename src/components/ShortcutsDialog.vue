<script setup lang="ts">
import { useId, useTemplateRef, watch } from 'vue'
import { useShortcutsStore } from '@/shortcuts/store'
import AppButton from './AppButton.vue'

/**
 * The keyboard shortcuts, and a switch to turn them off. A native modal dialog: it holds focus, Escape closes it,
 * and closing it returns focus to whatever opened it.
 */
const store = useShortcutsStore()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const headingId = useId()
const switchId = useId()

watch(
  () => store.listOpen,
  (open) => {
    if (open && !dialog.value?.open) dialog.value?.showModal()
    if (!open && dialog.value?.open) dialog.value.close()
  },
)
</script>

<template>
  <dialog
    ref="dialog"
    class="shortcuts"
    :aria-labelledby="headingId"
    @close="store.listOpen = false"
  >
    <h2 :id="headingId">Keyboard shortcuts</h2>
    <dl class="keys">
      <div>
        <dt><kbd>/</kbd></dt>
        <dd>Search</dd>
      </div>
      <div>
        <dt><kbd>r</kbd></dt>
        <dd>Another random joke</dd>
      </div>
      <div>
        <dt><kbd>?</kbd></dt>
        <dd>This list</dd>
      </div>
    </dl>
    <p class="switch">
      <input
        :id="switchId"
        type="checkbox"
        :checked="store.enabled"
        @change="store.setEnabled(($event.target as HTMLInputElement).checked)"
      />
      <label :for="switchId">Use these shortcuts</label>
    </p>
    <p class="note">
      They're single keys, so speech input can press them by accident. Turned off, they stay off in
      this browser, and this list is in the footer.
    </p>
    <AppButton variant="primary" @click="store.listOpen = false">Close</AppButton>
  </dialog>
</template>

<style scoped>
.shortcuts {
  width: min(100% - var(--space-6), 30rem);
  padding: var(--space-5);
  border: var(--border-width-strong) solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  box-shadow: var(--correction-shadow);
}

.shortcuts::backdrop {
  background: color-mix(in srgb, var(--color-scrim) 55%, transparent);
}

h2 {
  margin-top: 0;
}

.keys {
  display: grid;
  gap: var(--space-2);
  margin: 0 0 var(--space-5);
}

.keys div {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.keys dd {
  margin: 0;
}

kbd {
  display: inline-grid;
  place-items: center;
  min-width: var(--space-7);
  padding: var(--space-1) var(--space-2);
  border: var(--border-width) solid var(--color-border);
  box-shadow: var(--button-shadow);
  font-family: inherit;
  font-weight: 700;
}

.switch {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  min-height: var(--target-min);
  margin: 0;
  font-weight: 700;
}

.switch input {
  width: var(--space-5);
  height: var(--space-5);
  margin: 0;
  accent-color: var(--color-accent);
}

.note {
  margin: var(--space-2) 0 var(--space-5);
  color: var(--caption-color);
  font-size: var(--text-sm);
}
</style>

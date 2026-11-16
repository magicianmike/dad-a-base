<script setup lang="ts">
import { useShortcutsStore } from '@/shortcuts/store'

const shortcuts = useShortcutsStore()
const storybookUrl = import.meta.env.DEV ? 'http://localhost:6006' : '/storybook/'
</script>

<template>
  <footer class="site-footer">
    <p class="credit">
      Jokes syndicated from <a href="https://icanhazdadjoke.com">icanhazdadjoke.com</a>. The
      Dad-a-base regrets every one of them.
    </p>
    <nav aria-label="Colophon" class="links">
      <RouterLink to="/design-system">Design system</RouterLink>
      <a :href="storybookUrl">Storybook</a>
      <button type="button" class="shortcuts" @click="shortcuts.listOpen = true">
        Keyboard shortcuts
      </button>
    </nav>
  </footer>
</template>

<style scoped>
.site-footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
  align-items: center;
  justify-content: space-between;
  border-top: var(--masthead-rule);
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-weight: 700;
}

.credit {
  margin: var(--space-4) 0;
}

.links {
  display: flex;
  gap: var(--space-4);
}

.links a,
.shortcuts {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
}

/* A button, since it opens a dialog, but set like the links beside it. */
.shortcuts {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
</style>

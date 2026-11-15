<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({ titleTemplate: (title) => (title ? `${title} · Dadabase` : 'Dadabase') })
</script>

<template>
  <!-- A rough shell for the tracer. Milestone 2 replaces it. -->
  <header class="site-header">
    <RouterLink to="/" class="wordmark">Dadabase</RouterLink>
    <nav aria-label="Main">
      <RouterLink to="/random">Random</RouterLink>
    </nav>
  </header>
  <main id="main" class="site-main">
    <RouterView />
  </main>
  <footer class="site-footer">Jokes from icanhazdadjoke.com</footer>
</template>

<style scoped>
.site-header,
.site-footer {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
}

.site-main {
  flex: 1;
  width: 100%;
  max-width: var(--measure);
  margin-inline: auto;
  padding: var(--space-4);
}

.wordmark {
  font-weight: 700;
}
</style>

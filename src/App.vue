<script setup lang="ts">
import { useHead } from '@unhead/vue'
import SiteMasthead from '@/components/SiteMasthead.vue'

useHead({ titleTemplate: (title) => (title ? `${title} · Dad-a-base` : 'The Dad-a-base') })
</script>

<template>
  <!-- A rough shell. Milestone 2 replaces it: the dateline, skip links, theme toggle and the full navigation. -->
  <header class="site-header">
    <SiteMasthead />
    <nav aria-label="Main" class="nav">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/random">Random</RouterLink>
    </nav>
  </header>
  <main id="main" class="site-main">
    <RouterView />
  </main>
  <footer class="site-footer">
    <span>Jokes syndicated from icanhazdadjoke.com</span>
    <RouterLink to="/design-system">Design system</RouterLink>
  </footer>
</template>

<style scoped>
.site-header,
.site-main,
.site-footer {
  width: 100%;
  max-width: var(--measure);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.site-header {
  padding-top: var(--space-5);
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-5);
  justify-content: center;
  margin-top: var(--space-3);
  border-top: var(--masthead-rule);
  border-bottom: var(--masthead-rule);
}

.nav a {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
  border-bottom: var(--indicator-width) solid transparent;
}

.nav a.router-link-exact-active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.site-main {
  flex: 1;
  padding-block: var(--space-6) var(--space-8);
}

.site-footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
  justify-content: space-between;
  padding-block: var(--space-4);
  border-top: var(--masthead-rule);
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-weight: 700;
}
</style>

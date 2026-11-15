<script setup lang="ts">
import { computed } from 'vue'
import { mainNavigation } from '@/navigation'
import SiteMasthead from './SiteMasthead.vue'
import ThemeToggle from './ThemeToggle.vue'

const props = withDefaults(defineProps<{ date?: Date }>(), { date: () => new Date() })

const dateline = computed(() =>
  props.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }),
)
</script>

<template>
  <header class="site-header">
    <a href="#main" class="skip-link">Skip to the main story</a>
    <div class="top">
      <ThemeToggle />
    </div>
    <SiteMasthead />
    <p class="dateline">
      <span>{{ dateline }}</span>
      <span>All the jokes that are fit to groan</span>
      <span>Free, like Dad's advice</span>
    </p>
    <nav aria-label="Main" class="nav">
      <RouterLink v-for="item in mainNavigation" :key="item.to" :to="item.to">{{
        item.label
      }}</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  padding-top: var(--space-3);
}

/* Off screen until focused, then the first thing on the page. */
.skip-link {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 1;
  padding: var(--space-3) var(--space-4);
  border: var(--border-width-strong) solid var(--color-border);
  background: var(--color-surface-raised);
  box-shadow: var(--button-shadow);
  font-weight: 700;
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: none;
}

.top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-1);
}

.dateline {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-4);
  justify-content: space-between;
  margin: var(--space-3) 0 0;
  padding-block: var(--space-1);
  border-top: var(--masthead-rule);
  border-bottom: var(--border-width) solid var(--color-border);
  color: var(--caption-color);
  font-family: var(--kicker-font);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-5);
  justify-content: center;
  border-bottom: var(--masthead-rule);
}

.nav a {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  border-bottom: var(--indicator-width) solid transparent;
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.nav a[aria-current='page'] {
  border-bottom-color: var(--color-accent);
  color: var(--color-accent);
}

@media (width < 40rem) {
  .dateline {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>

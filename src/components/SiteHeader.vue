<script setup lang="ts">
import { computed } from 'vue'
import { mainNavigation } from '@/navigation'
import SectionsMenu from './SectionsMenu.vue'
import SiteMasthead from './SiteMasthead.vue'
import ThemeToggle from './ThemeToggle.vue'

const props = withDefaults(
  defineProps<{
    date?: Date
    /**
     * For a page that stands apart from the paper, such as the Case Study: the Masthead and a way back to the app,
     * without the dateline or the main navigation.
     */
    slim?: boolean
  }>(),
  { date: () => new Date(), slim: false },
)

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
      <RouterLink v-if="slim" to="/" class="back">
        <span aria-hidden="true">←</span> Back to the Dad-a-base
      </RouterLink>
      <SectionsMenu v-else class="sections" />
      <ThemeToggle />
    </div>
    <SiteMasthead />
    <hr v-if="slim" class="rule" />
    <template v-else>
      <p class="dateline">
        <span>{{ dateline }}</span>
        <span class="motto">All the jokes that are fit to groan</span>
        <span class="motto">Free, like Dad's advice</span>
      </p>
      <nav aria-label="Main" class="nav">
        <RouterLink v-for="item in mainNavigation" :key="item.to" :to="item.to">{{
          item.label
        }}</RouterLink>
      </nav>
    </template>
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
  gap: var(--space-4);
  align-items: center;
  justify-content: flex-end;
  margin-bottom: var(--space-1);
}

.back,
.sections {
  margin-right: auto;
}

.back {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  min-height: var(--target-min);
  font-weight: 700;
}

.rule {
  margin: var(--space-3) 0 0;
  border: 0;
  border-top: var(--masthead-rule);
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

/* On a phone, the date alone, and the sections in a drawer, so the story starts sooner. */
@media (width < 40rem) {
  .dateline {
    justify-content: center;
  }

  .motto {
    display: none;
  }

  /* The sections are in the Sections menu, at the top left. */
  .nav {
    display: none;
  }
}
</style>

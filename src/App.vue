<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import SiteFooter from '@/components/SiteFooter.vue'
import ShortcutsDialog from '@/components/ShortcutsDialog.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import ToastRegion from '@/components/ToastRegion.vue'
import { useShortcuts } from '@/shortcuts/useShortcuts'

useHead({ titleTemplate: (title) => (title ? `${title} · Dad-a-base` : 'The Dad-a-base') })
useShortcuts()

const route = useRoute()
</script>

<template>
  <div class="page">
    <SiteHeader :slim="route.meta.slim" />
    <main id="main" tabindex="-1" class="main">
      <!-- Each new page arrives with a short fade up. Keyed by path, so a new query on the same page, such as typing
      a Search, doesn't replay it. -->
      <RouterView v-slot="{ Component, route: shown }">
        <div :key="shown.path" class="arrive">
          <component :is="Component" />
        </div>
      </RouterView>
    </main>
    <SiteFooter />
    <ToastRegion />
    <ShortcutsDialog />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  max-width: var(--measure);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.main {
  flex: 1;
  padding-block: var(--space-6) var(--space-8);
}

.main:focus {
  outline: none;
}

/*
 * Nothing animates on the way out, so the new page is there at once, for focus to move to its headline. Only its
 * arrival is animated.
 */
.arrive {
  animation: arrive 250ms ease-out;
}

@keyframes arrive {
  from {
    opacity: 0;
    translate: 0 var(--space-3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .arrive {
    animation: none;
  }
}
</style>

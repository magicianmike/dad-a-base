<script setup lang="ts">
import { nextTick, useId, useTemplateRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { suggestedSearches } from '@/search/suggestions'
import { useRecentSearchesStore } from '@/stores/recentSearches'
import { useToastsStore } from '@/stores/toasts'
import AppButton from './AppButton.vue'

/**
 * Searches to try: the visitor's recent searches, when `recent` is set and they have some, then the suggested ones.
 * `to` gives each term's address. `level` sets the headings' level, to fit the page around them.
 */
withDefaults(
  defineProps<{ to: (term: string) => RouteLocationRaw; recent?: boolean; level?: 2 | 3 }>(),
  { recent: false, level: 2 },
)

const recentSearches = useRecentSearchesStore()
const toasts = useToastsStore()
const recentId = useId()
const suggestedId = useId()
const suggestedHeading = useTemplateRef<HTMLElement>('suggested-heading')

/** The Clear button goes with the list, so focus moves on to the suggestions. */
async function clear() {
  recentSearches.clear()
  toasts.show('Cleared your recent searches.')
  await nextTick()
  suggestedHeading.value?.focus()
}
</script>

<template>
  <div class="suggestions">
    <section v-if="recent && recentSearches.terms.length" :aria-labelledby="recentId">
      <component :is="`h${level}`" :id="recentId">Recent searches</component>
      <ul class="terms">
        <li v-for="term in recentSearches.terms" :key="term">
          <RouterLink :to="to(term)" class="term">{{ term }}</RouterLink>
        </li>
      </ul>
      <AppButton @click="clear">Clear recent searches</AppButton>
    </section>
    <section :aria-labelledby="suggestedId">
      <component :is="`h${level}`" :id="suggestedId" ref="suggested-heading" tabindex="-1"
        >Try searching for</component
      >
      <ul class="terms">
        <li v-for="term in suggestedSearches" :key="term">
          <RouterLink :to="to(term)" class="term">{{ term }}</RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.suggestions {
  display: grid;
  gap: var(--space-6);
}

.terms {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  margin: 0 0 var(--space-4);
  padding: 0;
  list-style: none;
}

.term {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  padding-inline: var(--space-3);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-surface-raised);
  font-family: var(--kicker-font);
  font-weight: 700;
  text-decoration: none;
}

.term:hover {
  text-decoration: underline;
}
</style>

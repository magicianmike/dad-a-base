<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, nextTick, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { useSearch } from '@/api/useSearch'
import ErrorView from '@/components/ErrorView.vue'
import JokeCard from '@/components/JokeCard.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchPagination from '@/components/SearchPagination.vue'
import SearchSuggestions from '@/components/SearchSuggestions.vue'
import StoryHeading from '@/components/StoryHeading.vue'
import { parsePage, resultsSummary } from '@/search/pagination'
import { useRecentSearchesStore } from '@/stores/recentSearches'

/** How long typing pauses before the Search runs. */
const SEARCH_DEBOUNCE_MS = 300

const route = useRoute()
const router = useRouter()
const recentSearches = useRecentSearchesStore()

/** The term and page are the URL's: `?q` and `?page`, with page 1 left out. */
const term = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
const page = computed(() => parsePage(route.query.page))

function query(q: string, p = 1): LocationQueryRaw {
  return { ...(q && { q }), ...(p > 1 && { page: String(p) }) }
}
const termLink = (q: string) => ({ path: '/search', query: query(q) })
const pageLink = (p: number) => ({ path: '/search', query: query(term.value, p) })

const { results, loading, error, retry } = useSearch(term, page)

// Typing searches once it pauses, replacing the history entry, and starts again at page 1.
const draft = ref(term.value)
let timer: ReturnType<typeof setTimeout> | undefined
function commit() {
  clearTimeout(timer)
  const q = draft.value.trim()
  if (q !== term.value) void router.replace({ query: query(q) })
}
watch(draft, () => {
  clearTimeout(timer)
  timer = setTimeout(commit, SEARCH_DEBOUNCE_MS)
})
onScopeDispose(() => clearTimeout(timer))

function submit() {
  commit()
  recentSearches.remember(draft.value)
}

/** The results for the term in the URL, once they've loaded. */
const settled = computed(() =>
  results.value?.term === term.value && !loading.value ? results.value : null,
)

/** The results on screen: the last ones loaded, kept while the next load, so typing doesn't flash an empty list. */
const shown = computed(() => (term.value && results.value ? results.value : null))

// A `?page` that isn't a whole number, or is past the end, becomes the nearest valid page.
const totalPages = computed(() => settled.value?.totalPages)
watch(
  [() => route.query.page, totalPages],
  ([raw, total]) => {
    const valid = total ? Math.min(page.value, total) : page.value
    const canonical = valid > 1 ? String(valid) : undefined
    if (raw !== undefined && raw !== canonical) {
      void router.replace({ query: query(term.value, valid) })
    }
  },
  { immediate: true },
)

// Changing page remembers the term. It, or a link or Back changing the term, moves focus to the results heading
// once they've loaded, since the link that was pressed may be gone. Typing keeps focus in the box.
const resultsHeading = useTemplateRef<HTMLElement>('results-heading')
const focusPending = ref(false)
watch([term, page], ([q, p], [oldQ, oldP]) => {
  if (q === oldQ && p !== oldP) {
    recentSearches.remember(q)
    focusPending.value = true
  } else if (q !== oldQ && q !== draft.value.trim()) {
    draft.value = q
    focusPending.value = q !== ''
  }
})
watch([focusPending, settled], async () => {
  if (!focusPending.value || !settled.value) return
  focusPending.value = false
  await nextTick()
  resultsHeading.value?.focus()
})

/**
 * Announced when a Search settles. It keeps its text while the next page loads, and turning a page doesn't change
 * it, so the count isn't announced again: the focused heading already reads the range.
 */
const announcement = ref('')
watch([term, settled], ([q, done]) => {
  if (!q) announcement.value = ''
  else if (done) {
    const { totalJokes } = done
    announcement.value =
      totalJokes === 0
        ? `No jokes about “${done.term}”.`
        : `${totalJokes} ${totalJokes === 1 ? 'joke' : 'jokes'} about “${done.term}”.`
  }
})

useHead({
  title: computed(() => {
    if (!term.value) return 'Search'
    return page.value > 1
      ? `Jokes about “${term.value}”, page ${page.value}`
      : `Jokes about “${term.value}”`
  }),
})
</script>

<template>
  <ErrorView v-if="error" :code="error.code" :on-retry="retry" />
  <template v-else>
    <StoryHeading kicker="The reading room">Search the archives</StoryHeading>
    <SearchBox v-model="draft" class="box" @submit="submit" />
    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>

    <SearchSuggestions v-if="!term" :to="termLink" recent />
    <p v-else-if="!shown">Searching the archives…</p>
    <section
      v-else-if="shown.totalJokes === 0"
      class="empty"
      aria-labelledby="no-results"
      :aria-busy="loading"
    >
      <h2 id="no-results" ref="results-heading" tabindex="-1">
        Nothing on file for “{{ shown.term }}”
      </h2>
      <p>
        No jokes matched. Check the spelling, try a shorter word, or try one of these. Or read
        <RouterLink to="/random">a random joke</RouterLink> instead.
      </p>
      <SearchSuggestions :to="termLink" :level="3" />
    </section>
    <section v-else class="results" aria-labelledby="results-heading" :aria-busy="loading">
      <h2 id="results-heading" ref="results-heading" tabindex="-1">
        {{ resultsSummary(shown.page, shown.totalJokes) }}
      </h2>
      <ol class="list" :start="(shown.page - 1) * 10 + 1">
        <li v-for="joke in shown.jokes" :key="joke.id">
          <JokeCard
            :joke="joke"
            :to="`/jokes/${joke.id}`"
            compact
            @click="recentSearches.remember(term)"
          />
        </li>
      </ol>
      <SearchPagination
        v-if="shown.totalPages > 1"
        :page="shown.page"
        :total-pages="shown.totalPages"
        :to="pageLink"
      />
    </section>
  </template>
</template>

<style scoped>
.box {
  max-width: var(--measure-reading);
  margin-bottom: var(--space-6);
}

.empty,
.results {
  max-width: var(--measure-reading);
}

.results[aria-busy='true'] {
  opacity: 0.6;
}

.list {
  display: grid;
  gap: var(--space-5);
  margin: 0 0 var(--space-6);
  padding: 0;
  list-style: none;
}
</style>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, nextTick, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import type { Joke } from '@/api/schemas'
import { useCachedJokes } from '@/api/useCachedJokes'
import JokeCard from '@/components/JokeCard.vue'
import RemoveButton from '@/components/RemoveButton.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchPagination from '@/components/SearchPagination.vue'
import StoryHeading from '@/components/StoryHeading.vue'
import { filterFavorites } from '@/favorites/filter'
import FallingList from '@/lists/FallingList.vue'
import { resultsSummary } from '@/lists/pagination'
import { useFallingRemoval } from '@/lists/useFallingRemoval'
import { useLocalPages } from '@/lists/useLocalPages'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastsStore } from '@/stores/toasts'

/** Ten a page, like Search. */
const PAGE_SIZE = 10
/** How long typing pauses before the count is announced. */
const ANNOUNCE_DELAY_MS = 400

const route = useRoute()
const router = useRouter()
const favorites = useFavoritesStore()
const toasts = useToastsStore()

useCachedJokes(() => favorites.favorites)

const count = computed(() => favorites.favorites.length)

/** The term is the URL's, as on Search: `?q`. */
const term = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))

function query(q: string): LocationQueryRaw {
  return q ? { q } : {}
}

const matches = computed(() => filterFavorites(favorites.favorites, term.value))
const { page, totalPages, shownPage, first, onPage, pageLink, onThisPage } = useLocalPages({
  path: '/favorites',
  items: () => matches.value,
  query: () => query(term.value),
  pageSize: PAGE_SIZE,
})

// The box filters as you type, with no request to wait for, so the address follows each keystroke. It replaces the
// history entry, and starts again at page 1.
const draft = ref(term.value)
watch(draft, (value) => {
  const q = value.trim()
  if (onThisPage() && q !== term.value) void router.replace({ path: '/favorites', query: query(q) })
})

const saved = useTemplateRef<HTMLElement>('saved')
const emptyHeading = useTemplateRef<HTMLElement>('empty-heading')
const resultsHeading = useTemplateRef<HTMLElement>('results-heading')

// A removed card falls off the fridge before it goes, and focus moves on.
const { falling, empty, remove, fallen } = useFallingRemoval({
  list: saved,
  count: () => count.value,
  heading: resultsHeading,
  emptyHeading,
})
function removeFavorite(joke: Joke) {
  favorites.toggle(joke)
  toasts.show('Removed from your favorites.')
}

const noMatches = computed(
  () => term.value !== '' && matches.value.length === 0 && falling.value === 0,
)

const heading = computed(() => {
  const about = term.value ? ` about “${term.value}”` : ''
  if (noMatches.value) return `Nothing on the fridge${about}`
  const total = matches.value.length
  if (total === 0) return 'No saved jokes'
  if (totalPages.value === 1) return `${total} saved joke${total === 1 ? '' : 's'}${about}`
  return `${resultsSummary(shownPage.value, total, PAGE_SIZE)}${about}`
})

useHead({
  title: computed(() => {
    const title = term.value ? `Favorites about “${term.value}”` : 'Favorites'
    return shownPage.value > 1 ? `${title}, page ${shownPage.value}` : title
  }),
})

// Turning a page, or Back or a link changing the term, moves focus to the heading, since the link that was pressed
// may be gone. Typing keeps focus in the box, and the box follows the term.
watch([term, page], async ([q, p], [oldQ, oldP]) => {
  if (!onThisPage()) return
  if (q === oldQ && p === oldP) return
  if (q !== oldQ && q === draft.value.trim()) return
  if (q !== oldQ) draft.value = q
  await nextTick()
  // Without scrolling: turning a page has already sent the page back to the top.
  resultsHeading.value?.focus({ preventScroll: true })
})

/** Announced once typing pauses: how many Favorites the term finds. */
const announcement = ref('')
let announceTimer: ReturnType<typeof setTimeout> | undefined
watch(term, (q) => {
  clearTimeout(announceTimer)
  announceTimer = setTimeout(() => {
    const n = matches.value.length
    announcement.value = !q
      ? ''
      : n === 0
        ? `No saved jokes about “${q}”.`
        : `${n} saved ${n === 1 ? 'joke' : 'jokes'} about “${q}”.`
  }, ANNOUNCE_DELAY_MS)
})
onScopeDispose(() => clearTimeout(announceTimer))
</script>

<template>
  <StoryHeading kicker="Clippings">Stuck to the fridge</StoryHeading>
  <section v-if="empty" class="empty" aria-labelledby="empty-heading">
    <h2 id="empty-heading" ref="empty-heading" tabindex="-1">Nothing on the fridge yet</h2>
    <p>
      Press Fave on any joke to keep it here. Favorites are saved in this browser, so they stay when
      you come back.
    </p>
    <ul class="ways">
      <li><RouterLink to="/random">Read a random joke</RouterLink></li>
      <li><RouterLink to="/search">Search the jokes</RouterLink></li>
    </ul>
  </section>
  <template v-else>
    <SearchBox v-model="draft" label="Search your favorites" class="box" />
    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
    <section ref="saved" class="saved" aria-labelledby="saved-heading">
      <h2 id="saved-heading" ref="results-heading" tabindex="-1">{{ heading }}</h2>
      <template v-if="noMatches">
        <p>None of your saved jokes mention it. Check the spelling, or try a shorter word.</p>
        <ul class="ways">
          <li><RouterLink to="/favorites">Show all your favorites</RouterLink></li>
          <li>
            <RouterLink :to="{ path: '/search', query: { q: term } }">
              Search every joke for “{{ term }}”
            </RouterLink>
          </li>
        </ul>
      </template>
      <p v-else class="note">Newest first, saved in this browser.</p>
      <FallingList
        v-slot="{ item: joke, index }"
        :items="onPage"
        :item-key="(joke) => joke.id"
        :start="first"
        :falling="falling > 0"
        @fallen="fallen"
      >
        <JokeCard :joke="joke" :to="`/jokes/${joke.id}`" compact>
          <template #corner>
            <RemoveButton
              label="Remove from favorites"
              icon="heart"
              @click="remove(index, () => removeFavorite(joke))"
            />
          </template>
        </JokeCard>
      </FallingList>
      <SearchPagination
        v-if="totalPages > 1"
        :page="shownPage"
        :total-pages="totalPages"
        :to="pageLink"
      />
    </section>
  </template>
</template>

<style scoped>
.box,
.empty,
.saved {
  max-width: var(--measure-reading);
}

.box {
  margin-bottom: var(--space-6);
}

.note {
  margin-top: 0;
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-style: italic;
}

.ways {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
  padding: 0;
  list-style: none;
}

.ways a {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  font-weight: 700;
}
</style>

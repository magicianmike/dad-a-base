<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, nextTick, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import type { Joke } from '@/api/schemas'
import { useCachedJokes } from '@/api/useCachedJokes'
import JokeCard from '@/components/JokeCard.vue'
import RemoveFavoriteButton from '@/components/RemoveFavoriteButton.vue'
import SearchBox from '@/components/SearchBox.vue'
import SearchPagination from '@/components/SearchPagination.vue'
import StoryHeading from '@/components/StoryHeading.vue'
import { filterFavorites } from '@/favorites/filter'
import { parsePage, resultsSummary } from '@/search/pagination'
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

/** The term and page are the URL's, as on Search: `?q` and `?page`, with page 1 left out. */
const term = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
const page = computed(() => parsePage(route.query.page))

function query(q: string, p = 1): LocationQueryRaw {
  return { ...(q && { q }), ...(p > 1 && { page: String(p) }) }
}
const pageLink = (p: number) => ({ path: '/favorites', query: query(term.value, p) })
/** The URL's watchers only act here, not while the router is already leaving for another page. */
const onThisPage = () => route.path === '/favorites'

// The box filters as you type, with no request to wait for, so the address follows each keystroke. It replaces the
// history entry, and starts again at page 1.
const draft = ref(term.value)
watch(draft, (value) => {
  const q = value.trim()
  if (onThisPage() && q !== term.value) void router.replace({ path: '/favorites', query: query(q) })
})

const matches = computed(() => filterFavorites(favorites.favorites, term.value))
const totalPages = computed(() => Math.max(1, Math.ceil(matches.value.length / PAGE_SIZE)))
const shownPage = computed(() => Math.min(page.value, totalPages.value))
const onPage = computed(() =>
  matches.value.slice((shownPage.value - 1) * PAGE_SIZE, shownPage.value * PAGE_SIZE),
)

// A `?page` that isn't a whole number, or is past the end, becomes the nearest valid page. Removing the last Joke on
// the last page does the same.
watch(
  [() => route.query.page, totalPages],
  ([raw]) => {
    if (!onThisPage()) return
    const canonical = shownPage.value > 1 ? String(shownPage.value) : undefined
    if (raw !== undefined && raw !== canonical) {
      void router.replace({ path: '/favorites', query: query(term.value, shownPage.value) })
    }
  },
  { immediate: true },
)

// A removed card falls off the fridge before it goes. Until the last one has, the list stays and the empty state
// waits, so the last card falls too. Only a removal animates: cards a filter or a new page takes away just go.
const falling = ref(0)
const empty = computed(() => count.value === 0 && falling.value === 0)
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

const saved = useTemplateRef<HTMLElement>('saved')
const emptyHeading = useTemplateRef<HTMLElement>('empty-heading')
const resultsHeading = useTemplateRef<HTMLElement>('results-heading')

// Turning a page, or Back or a link changing the term, moves focus to the heading, since the link that was pressed
// may be gone. Typing keeps focus in the box, and the box follows the term.
watch([term, page], async ([q, p], [oldQ, oldP]) => {
  if (!onThisPage()) return
  if (q === oldQ && p === oldP) return
  if (q !== oldQ && q === draft.value.trim()) return
  if (q !== oldQ) draft.value = q
  await nextTick()
  resultsHeading.value?.focus()
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

// Removing takes the card away, so focus moves to the next card's Remove button, the previous one's if it was the
// last on the page, or, once the card has fallen, the heading, or the empty state if there are none. A falling
// card's button doesn't count. Only the visitor's own removal moves focus, not one in another tab.
let focusAfterFall: 'heading' | 'empty' | null = null

async function remove(joke: Joke, index: number) {
  falling.value++
  favorites.toggle(joke)
  toasts.show('Removed from your favorites.')
  await nextTick()
  const buttons =
    saved.value?.querySelectorAll<HTMLElement>('.list > li:not(.fall-leave-active) .remove') ?? []
  const next = buttons[Math.min(index, buttons.length - 1)]
  if (next) next.focus()
  else focusAfterFall = count.value === 0 ? 'empty' : 'heading'
}

/** Pins a falling card where it was, so leaving the flow doesn't move it before it falls. */
function pin(el: Element) {
  const card = el as HTMLElement
  card.style.top = `${card.offsetTop}px`
  card.style.width = `${card.offsetWidth}px`
}

async function fallen() {
  falling.value = Math.max(0, falling.value - 1)
  if (falling.value > 0 || !focusAfterFall) return
  const target = focusAfterFall
  focusAfterFall = null
  await nextTick()
  ;(target === 'empty' ? emptyHeading : resultsHeading).value?.focus()
}
</script>

<template>
  <StoryHeading kicker="Clippings">Stuck to the fridge</StoryHeading>
  <section v-if="empty" class="empty" aria-labelledby="empty-heading">
    <h2 id="empty-heading" ref="empty-heading" tabindex="-1">Nothing on the fridge yet</h2>
    <p>
      Press Favorite on any joke to keep it here. Favorites are saved in this browser, so they stay
      when you come back.
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
      <TransitionGroup
        tag="ol"
        name="fall"
        :css="falling > 0"
        class="list"
        :start="(shownPage - 1) * PAGE_SIZE + 1"
        @before-leave="pin"
        @after-leave="fallen"
      >
        <li v-for="(joke, index) in onPage" :key="joke.id">
          <JokeCard :joke="joke" :to="`/jokes/${joke.id}`" compact>
            <template #corner>
              <RemoveFavoriteButton @click="remove(joke, index)" />
            </template>
          </JokeCard>
        </li>
      </TransitionGroup>
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

.list {
  position: relative;
  display: grid;
  gap: var(--space-6);
  margin: var(--space-5) 0 var(--space-6);
  padding: 0;
  list-style: none;
}

/* The cards below a removed one slide up into its place. */
.fall-move {
  transition: transform 300ms ease;
}

/* A removed card, out of the flow and pinned where it was, drops, tilts and fades. After .fall-move, which a
   leaving card can also get, so its fade isn't lost. */
.fall-leave-active {
  position: absolute;
  transition:
    opacity 300ms ease-in,
    transform 300ms ease-in;
}

.fall-leave-to {
  opacity: 0;
  transform: translateY(var(--space-6)) rotate(-4deg);
}

@media (prefers-reduced-motion: reduce) {
  .fall-leave-active,
  .fall-move {
    transition: none;
  }
}
</style>

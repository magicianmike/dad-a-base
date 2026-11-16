<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCachedJokes } from '@/api/useCachedJokes'
import JokeCard from '@/components/JokeCard.vue'
import RemoveFavoriteButton from '@/components/RemoveFavoriteButton.vue'
import SearchPagination from '@/components/SearchPagination.vue'
import StoryHeading from '@/components/StoryHeading.vue'
import { groanScore } from '@/groans/score'
import { parsePage, resultsSummary } from '@/search/pagination'
import { useGroansStore, type Groan } from '@/stores/groans'
import { useToastsStore } from '@/stores/toasts'

/** Ten a page, like Search and Favorites. */
const PAGE_SIZE = 10

const route = useRoute()
const router = useRouter()
const groans = useGroansStore()
const toasts = useToastsStore()

// Each Groan holds its whole Joke, so opening one makes no request.
useCachedJokes(() => groans.groans.map(({ joke }) => joke))

const count = computed(() => groans.ranked.length)
const page = computed(() => parsePage(route.query.page))
const totalPages = computed(() => Math.max(1, Math.ceil(count.value / PAGE_SIZE)))
const shownPage = computed(() => Math.min(page.value, totalPages.value))
const firstRank = computed(() => (shownPage.value - 1) * PAGE_SIZE + 1)
const onPage = computed(() => groans.ranked.slice(firstRank.value - 1, shownPage.value * PAGE_SIZE))

const pageLink = (p: number) => ({ path: '/groans', query: p > 1 ? { page: String(p) } : {} })
const onThisPage = () => route.path === '/groans'

// A `?page` that isn't a whole number, or is past the end, becomes the nearest valid page. Removing the last Groan on
// the last page does the same.
watch(
  [() => route.query.page, totalPages],
  ([raw]) => {
    if (!onThisPage()) return
    const canonical = shownPage.value > 1 ? String(shownPage.value) : undefined
    if (raw !== undefined && raw !== canonical) void router.replace(pageLink(shownPage.value))
  },
  { immediate: true },
)

const heading = computed(() => {
  if (totalPages.value === 1) return `${count.value} groaned joke${count.value === 1 ? '' : 's'}`
  return resultsSummary(shownPage.value, count.value, PAGE_SIZE)
})

useHead({
  title: computed(() =>
    shownPage.value > 1 ? `Groan Leaderboard, page ${shownPage.value}` : 'Groan Leaderboard',
  ),
})

/** A Groan's score as shown: "7.2/10", or "Groan" for a tap. */
function shownScore({ score }: Groan) {
  const shown = groanScore(score)
  return shown ? `${shown}/10` : 'Groan'
}

const ranked = useTemplateRef<HTMLElement>('ranked')
const emptyHeading = useTemplateRef<HTMLElement>('empty-heading')
const resultsHeading = useTemplateRef<HTMLElement>('results-heading')

// Turning a page moves focus to the heading, since the link that was pressed may be gone.
watch(page, async () => {
  if (!onThisPage()) return
  await nextTick()
  resultsHeading.value?.focus({ preventScroll: true })
})

// A removed card falls off the board, as on Favorites, before it goes. Until the last one has, the list stays and the
// empty state waits, so the last card falls too. Only a removal animates: cards a new page takes away just go.
const falling = ref(0)
const empty = computed(() => count.value === 0 && falling.value === 0)

// Removing takes the card away, so focus moves to the next card's Remove button, the previous one's if it was the
// last on the page, or, once the card has fallen, the heading, or the empty state if there are none. A falling card's
// button doesn't count.
let focusAfterFall: 'heading' | 'empty' | null = null

async function remove(groan: Groan, index: number) {
  falling.value++
  groans.remove(groan.joke.id)
  toasts.show('Removed from your groans.')
  await nextTick()
  const buttons =
    ranked.value?.querySelectorAll<HTMLElement>('.list > li:not(.fall-leave-active) .remove') ?? []
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
  <StoryHeading kicker="Groan Leaderboard">The worst of the worst</StoryHeading>
  <section v-if="empty" class="empty" aria-labelledby="empty-heading">
    <h2 id="empty-heading" ref="empty-heading" tabindex="-1">No groans yet</h2>
    <p>
      Press and hold Groan on any joke to rank it here: the longer the groan, the higher it goes.
      Groans are saved in this browser, so they stay when you come back.
    </p>
    <ul class="ways">
      <li><RouterLink to="/random">Read a random joke</RouterLink></li>
    </ul>
  </section>
  <section v-else ref="ranked" class="ranked" aria-labelledby="ranked-heading">
    <h2 id="ranked-heading" ref="results-heading" tabindex="-1">{{ heading }}</h2>
    <p class="note">Worst first, by how long you groaned. Saved in this browser.</p>
    <TransitionGroup
      tag="ol"
      name="fall"
      :css="falling > 0"
      class="list"
      @before-leave="pin"
      @after-leave="fallen"
    >
      <li v-for="(groan, index) in onPage" :key="groan.joke.id" class="row">
        <p class="rank"><span class="visually-hidden">Number </span>{{ firstRank + index }}</p>
        <div class="entry">
          <JokeCard :joke="groan.joke" :to="`/jokes/${groan.joke.id}`" compact>
            <template #corner>
              <RemoveFavoriteButton
                label="Remove from groans"
                icon="cross"
                @click="remove(groan, index)"
              />
            </template>
          </JokeCard>
          <p class="score" :style="{ '--groan-level': groan.score }">
            <span class="meter" aria-hidden="true"><span class="fill" /></span>
            <span><span class="visually-hidden">Groan score </span>{{ shownScore(groan) }}</span>
          </p>
        </div>
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

<style scoped>
.empty,
.ranked {
  max-width: var(--measure-reading);
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

/* The rank, large in the headline face, beside the clipping. */
.row {
  display: grid;
  grid-template-columns: 3ch 1fr;
  gap: var(--space-4);
  align-items: start;
}

.rank {
  margin: 0;
  color: var(--kicker-color);
  font-family: var(--headline-font);
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1;
  text-align: right;
}

.entry {
  min-width: 0;
}

/* The score: the Groan button's fill, at rest where the hold stopped, and the number. */
.score {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin: var(--space-3) 0 0;
  font-weight: 700;
}

.meter {
  position: relative;
  flex: 1;
  height: var(--space-3);
  overflow: hidden;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-surface-raised);
}

.fill {
  position: absolute;
  inset: 0;
  background: var(--groan-fill);
  clip-path: inset(0 calc((1 - var(--groan-level)) * 100%) 0 0);
}

/* The cards below a removed one slide up into its place. */
.fall-move {
  transition: transform 300ms ease;
}

/* A removed card, out of the flow and pinned where it was, drops, tilts and fades, as on Favorites. After .fall-move,
   which a leaving card can also get, so its fade isn't lost. */
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

/* On a phone, the rank sits above its clipping, so the Joke keeps the width. */
@media (width < 40rem) {
  .row {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .rank {
    font-size: var(--text-2xl);
    text-align: left;
  }
}
</style>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useCachedJokes } from '@/api/useCachedJokes'
import JokeCard from '@/components/JokeCard.vue'
import RemoveButton from '@/components/RemoveButton.vue'
import SearchPagination from '@/components/SearchPagination.vue'
import StoryHeading from '@/components/StoryHeading.vue'
import { groanScore } from '@/groans/score'
import FallingList from '@/lists/FallingList.vue'
import { resultsSummary } from '@/lists/pagination'
import { useFallingRemoval } from '@/lists/useFallingRemoval'
import { useLocalPages } from '@/lists/useLocalPages'
import { useGroansStore, type Groan } from '@/stores/groans'
import { useToastsStore } from '@/stores/toasts'

/** Ten a page, like Search and Favorites. */
const PAGE_SIZE = 10

const groans = useGroansStore()
const toasts = useToastsStore()

// Each Groan holds its whole Joke, so opening one makes no request.
useCachedJokes(() => groans.groans.map(({ joke }) => joke))

const count = computed(() => groans.ranked.length)
const { page, totalPages, shownPage, first, onPage, pageLink, onThisPage } = useLocalPages({
  path: '/groans',
  items: () => groans.ranked,
  pageSize: PAGE_SIZE,
})

const heading = computed(() => {
  if (totalPages.value === 1) return `${count.value} groaned joke${count.value === 1 ? '' : 's'}`
  return resultsSummary(shownPage.value, count.value, PAGE_SIZE)
})

useHead({
  title: computed(() =>
    shownPage.value > 1 ? `Groan Leaderboard, page ${shownPage.value}` : 'Groan Leaderboard',
  ),
})

/** A Groan's score as shown: "7.2/10". */
function shownScore({ score }: Groan) {
  return `${groanScore(score)}/10`
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

// A removed card falls off the board, as on Favorites, and focus moves on.
const { falling, empty, remove, fallen } = useFallingRemoval({
  list: ranked,
  count: () => count.value,
  heading: resultsHeading,
  emptyHeading,
})

function removeGroan(groan: Groan) {
  groans.remove(groan.joke.id)
  toasts.show('Removed from your groans.')
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
    <FallingList
      v-slot="{ item: groan, index }"
      :items="onPage"
      :item-key="(groan) => groan.joke.id"
      :falling="falling > 0"
      @fallen="fallen"
    >
      <div class="row">
        <p class="rank"><span class="visually-hidden">Number </span>{{ first + index }}</p>
        <div class="entry">
          <JokeCard :joke="groan.joke" :to="`/jokes/${groan.joke.id}`" compact>
            <template #corner>
              <RemoveButton
                label="Remove from groans"
                icon="cross"
                @click="remove(index, () => removeGroan(groan))"
              />
            </template>
          </JokeCard>
          <p class="score" :style="{ '--groan-level': groan.score }">
            <span class="meter" aria-hidden="true"><span class="fill" /></span>
            <span><span class="visually-hidden">Groan score </span>{{ shownScore(groan) }}</span>
          </p>
        </div>
      </div>
    </FallingList>
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

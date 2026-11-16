<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FavoritesPeek from '@/components/FavoritesPeek.vue'
import RandomJokeStory from '@/components/RandomJokeStory.vue'
import SearchBox from '@/components/SearchBox.vue'
import { useRecentSearchesStore } from '@/stores/recentSearches'

useHead({ title: '' })

const router = useRouter()
const recentSearches = useRecentSearchesStore()
const term = ref('')

function search() {
  const q = term.value.trim()
  recentSearches.remember(q)
  void router.push({ path: '/search', query: q ? { q } : {} })
}
</script>

<template>
  <RandomJokeStory
    kicker="Today's top story"
    headline="Local dad says the thing again"
    caption="Witnesses report groaning."
  />
  <section class="search" aria-labelledby="home-search">
    <h2 id="home-search">Looking for one in particular?</h2>
    <SearchBox v-model="term" @submit="search" />
  </section>
  <FavoritesPeek />
</template>

<style scoped>
.search {
  max-width: var(--measure-reading);
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: var(--masthead-rule);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useCachedJokes } from '@/api/useCachedJokes'
import { useFavoritesStore } from '@/stores/favorites'
import JokeCard from './JokeCard.vue'

/** The newest Favorites, for home. Shows nothing until there are some. */
const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 3 })

const favorites = useFavoritesStore()
const newest = computed(() => favorites.favorites.slice(0, props.limit))
const count = computed(() => favorites.favorites.length)

useCachedJokes(newest)
</script>

<template>
  <section v-if="count" class="peek" aria-labelledby="peek-heading">
    <h2 id="peek-heading">From your fridge</h2>
    <ol class="list">
      <li v-for="joke in newest" :key="joke.id">
        <JokeCard :joke="joke" :to="`/jokes/${joke.id}`" compact />
      </li>
    </ol>
    <RouterLink to="/favorites" class="all">
      {{ count > limit ? `See all ${count} favorites` : 'Go to your favorites' }}
    </RouterLink>
  </section>
</template>

<style scoped>
.peek {
  max-width: var(--measure-reading);
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: var(--masthead-rule);
}

.list {
  display: grid;
  gap: var(--space-5);
  margin: 0 0 var(--space-4);
  padding: 0;
  list-style: none;
}

.all {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  font-weight: 700;
}
</style>

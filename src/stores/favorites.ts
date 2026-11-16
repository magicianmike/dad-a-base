import { defineStore } from 'pinia'
import { computed } from 'vue'
import { z } from 'zod'
import { JokeSchema, type Joke } from '@/api/schemas'
import { useStoredRef } from './useStoredRef'

export const FAVORITES_STORAGE_KEY = 'dadabase:favorites'

/**
 * The visitor's Favorites, newest first, as whole Jokes so the Favorites page needs no API calls. Saved in this
 * browser and kept in step across its tabs.
 */
export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = useStoredRef(FAVORITES_STORAGE_KEY, z.array(JokeSchema), () => [])
  const ids = computed(() => new Set(favorites.value.map(({ id }) => id)))

  function isFavorite(id: string) {
    return ids.value.has(id)
  }

  /** Adds or removes a Joke, and says which. */
  function toggle(joke: Joke): 'added' | 'removed' {
    if (isFavorite(joke.id)) {
      favorites.value = favorites.value.filter(({ id }) => id !== joke.id)
      return 'removed'
    }
    favorites.value = [{ id: joke.id, joke: joke.joke }, ...favorites.value]
    return 'added'
  }

  return { favorites, isFavorite, toggle }
})

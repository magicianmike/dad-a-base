import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import { JokeSchema, type Joke } from '@/api/schemas'

export const FAVORITES_STORAGE_KEY = 'dadabase:favorites'

const StoredFavoritesSchema = z.array(JokeSchema)

/** Whatever is stored, as Favorites, or none if it's missing, unreadable or not valid. */
function parse(raw: string | null): Joke[] {
  if (!raw) return []
  try {
    const parsed = StoredFavoritesSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

function read(): Joke[] {
  try {
    return parse(localStorage.getItem(FAVORITES_STORAGE_KEY))
  } catch {
    return []
  }
}

/**
 * The visitor's Favorites, newest first, as whole Jokes so the Favorites page needs no API calls. Saved in this
 * browser and kept in step across its tabs.
 */
export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Joke[]>(read())
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

  watch(favorites, (value) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Not remembered beyond this page, but still shown.
    }
  })

  // Another tab changed them.
  addEventListener('storage', (event) => {
    if (event.key === FAVORITES_STORAGE_KEY) favorites.value = parse(event.newValue)
  })

  return { favorites, isFavorite, toggle }
})

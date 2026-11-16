import { defineStore } from 'pinia'
import { z } from 'zod'
import { useStoredRef } from './useStoredRef'

export const RECENT_SEARCHES_STORAGE_KEY = 'dadabase:recent-searches'

/** How many recent searches are kept. */
export const RECENT_SEARCHES_MAX = 5

const StoredSearchesSchema = z.array(z.string().min(1)).max(RECENT_SEARCHES_MAX)

/**
 * The visitor's last few search terms, newest first, saved in this browser. A term is remembered when the visitor
 * shows they meant it (pressing Enter, changing page or opening a Joke), not on every keystroke.
 */
export const useRecentSearchesStore = defineStore('recentSearches', () => {
  // Unlike Favorites, not kept in step with other tabs: each tab remembers its own searching.
  const terms = useStoredRef(RECENT_SEARCHES_STORAGE_KEY, StoredSearchesSchema, () => [], {
    followTabs: false,
  })

  function remember(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    const others = terms.value.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())
    terms.value = [trimmed, ...others].slice(0, RECENT_SEARCHES_MAX)
  }

  function clear() {
    terms.value = []
  }

  return { terms, remember, clear }
})

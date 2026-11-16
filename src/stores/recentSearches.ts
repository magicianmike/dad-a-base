import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { z } from 'zod'

export const RECENT_SEARCHES_STORAGE_KEY = 'dadabase:recent-searches'

/** How many recent searches are kept. */
export const RECENT_SEARCHES_MAX = 5

const StoredSearchesSchema = z.array(z.string().min(1)).max(RECENT_SEARCHES_MAX)

function read(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)
    if (!raw) return []
    const parsed = StoredSearchesSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

/**
 * The visitor's last few search terms, newest first, saved in this browser. A term is remembered when the visitor
 * shows they meant it (pressing Enter, changing page or opening a Joke), not on every keystroke.
 */
export const useRecentSearchesStore = defineStore('recentSearches', () => {
  const terms = ref<string[]>(read())

  function remember(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    const others = terms.value.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())
    terms.value = [trimmed, ...others].slice(0, RECENT_SEARCHES_MAX)
  }

  function clear() {
    terms.value = []
  }

  watch(terms, (value) => {
    try {
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Not remembered beyond this page, but still shown.
    }
  })

  return { terms, remember, clear }
})

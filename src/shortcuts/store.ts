import { defineStore } from 'pinia'
import { ref } from 'vue'

/** The single-key shortcuts. `?` isn't one a page can take over: it always opens the list. */
export type ShortcutKey = '/' | 'r'

export const SHORTCUTS_STORAGE_KEY = 'dadabase:shortcuts'

// Storage can throw (private windows, blocked site data). The choice then just isn't remembered.
function read(): boolean {
  try {
    return localStorage.getItem(SHORTCUTS_STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

function write(enabled: boolean) {
  try {
    if (enabled) localStorage.removeItem(SHORTCUTS_STORAGE_KEY)
    else localStorage.setItem(SHORTCUTS_STORAGE_KEY, 'off')
  } catch {
    // Not remembered, but still applied.
  }
}

/**
 * The keyboard shortcuts: whether they're on (WCAG 2.1.4 asks that single-key shortcuts can be turned off, since
 * speech input can press them by accident), whether their list is open, and what each key does on the page showing.
 */
export const useShortcutsStore = defineStore('shortcuts', () => {
  const enabled = ref(read())
  const listOpen = ref(false)
  const handlers = new Map<ShortcutKey, () => void>()

  function setEnabled(value: boolean) {
    enabled.value = value
    write(value)
  }

  /** Gives a key its meaning on this page, until the returned function takes it back. The latest wins. */
  function handle(key: ShortcutKey, handler: () => void) {
    handlers.set(key, handler)
    return () => {
      if (handlers.get(key) === handler) handlers.delete(key)
    }
  }

  return {
    enabled,
    listOpen,
    setEnabled,
    handle,
    handlerFor: (key: ShortcutKey) => handlers.get(key),
  }
})

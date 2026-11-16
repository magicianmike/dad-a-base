import { nextTick, onScopeDispose } from 'vue'
import { useRouter } from 'vue-router'
import { useShortcutsStore, type ShortcutKey } from './store'

/** Where someone is typing, so a key is a letter, not a shortcut. */
function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.closest('input, textarea, select') !== null)
  )
}

/**
 * The shortcut a key press asks for, if any. Not while typing, with a modifier held (the browser's and the screen
 * reader's own shortcuts), mid-composition, or with a dialog open.
 */
export function shortcutFor(event: KeyboardEvent): ShortcutKey | '?' | null {
  if (event.defaultPrevented || event.isComposing) return null
  if (event.ctrlKey || event.metaKey || event.altKey) return null
  if (isTyping(event.target) || document.querySelector('dialog[open]')) return null
  return event.key === '/' || event.key === 'r' || event.key === '?' ? event.key : null
}

/**
 * Listens for the shortcuts for as long as the app is on the page. A key does what the page showing says it does
 * (`useShortcut`), and otherwise goes where it can: `/` to Search, and `r` to Random. `?` opens their list.
 */
export function useShortcuts() {
  const store = useShortcutsStore()
  const router = useRouter()

  async function onKeydown(event: KeyboardEvent) {
    if (!store.enabled) return
    const key = shortcutFor(event)
    if (!key) return
    // Firefox's quick find also listens for `/`.
    event.preventDefault()
    if (key === '?') {
      store.listOpen = true
      return
    }
    const here = store.handlerFor(key)
    if (here) return here()
    await router.push(key === '/' ? '/search' : '/random')
    // Search gives `/` its meaning once it's on the page, after the navigation has focused its headline.
    await nextTick()
    if (key === '/') store.handlerFor('/')?.()
  }

  addEventListener('keydown', onKeydown)
  onScopeDispose(() => removeEventListener('keydown', onKeydown))
}

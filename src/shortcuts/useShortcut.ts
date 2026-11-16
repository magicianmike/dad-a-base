import { onScopeDispose } from 'vue'
import { useShortcutsStore, type ShortcutKey } from './store'

/** Gives a shortcut key its meaning while the calling component is on the page. */
export function useShortcut(key: ShortcutKey, handler: () => void) {
  onScopeDispose(useShortcutsStore().handle(key, handler))
}

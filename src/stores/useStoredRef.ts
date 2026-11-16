import { onScopeDispose, ref, watch, type Ref } from 'vue'
import type { z } from 'zod'

/**
 * A value saved in this browser under `key`: loaded through `schema`, saved on each change, and, unless told not to,
 * kept in step with other tabs. Missing, unreadable or invalid, it's the fallback, and if storage is blocked it's
 * still kept for the page. Each change replaces the value, so a store assigns a new array rather than pushing.
 */
export function useStoredRef<T>(
  key: string,
  schema: z.ZodType<T>,
  fallback: () => T,
  { followTabs = true }: { followTabs?: boolean } = {},
): Ref<T> {
  function parse(raw: string | null): T {
    if (raw === null) return fallback()
    try {
      const parsed = schema.safeParse(JSON.parse(raw))
      return parsed.success ? parsed.data : fallback()
    } catch {
      return fallback()
    }
  }

  function read(): T {
    try {
      return parse(localStorage.getItem(key))
    } catch {
      return fallback()
    }
  }

  const stored = ref(read()) as Ref<T>

  watch(stored, (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Not remembered beyond this page, but still shown.
    }
  })

  if (followTabs) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) stored.value = parse(event.newValue)
    }
    addEventListener('storage', onStorage)
    onScopeDispose(() => removeEventListener('storage', onStorage))
  }

  return stored
}

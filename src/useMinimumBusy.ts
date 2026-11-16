import { computed, onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * Busy while `loading` is, and for at least `minimumMs` from when it started, so a fast answer doesn't make a busy
 * control flicker. Whatever loaded still shows at once: only the busy state is held.
 */
export function useMinimumBusy(loading: Readonly<Ref<boolean>>, minimumMs: number) {
  const holding = ref(false)
  let started = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(loading, (now) => {
    clearTimeout(timer)
    if (now) {
      started = Date.now()
      holding.value = true
      return
    }
    timer = setTimeout(
      () => {
        holding.value = false
      },
      Math.max(0, minimumMs - (Date.now() - started)),
    )
  })
  onScopeDispose(() => clearTimeout(timer))

  return computed(() => loading.value || holding.value)
}

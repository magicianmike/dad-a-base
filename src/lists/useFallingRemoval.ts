import { computed, nextTick, ref, type Ref } from 'vue'

/**
 * Removing a card from a `FallingList`, and where focus goes after. The card falls before it goes, and until the last
 * one has, the list stays and the empty state waits, so the last card falls too. Focus moves to the next card's
 * Remove button, the previous one's if it was the last on the page, or, once the card has fallen, the heading, or
 * the empty state if there are none. A falling card's button doesn't count. Only the visitor's own removal moves
 * focus, not one in another tab.
 */
export function useFallingRemoval({
  list,
  count,
  heading,
  emptyHeading,
}: {
  /** What holds the list, to find the Remove buttons in. */
  list: Ref<HTMLElement | null>
  count: () => number
  heading: Ref<HTMLElement | null>
  emptyHeading: Ref<HTMLElement | null>
}) {
  const falling = ref(0)
  const empty = computed(() => count() === 0 && falling.value === 0)
  let focusAfterFall: 'heading' | 'empty' | null = null

  /** Removes the card at `index` on the page, with `take` taking its item out of the store. */
  async function remove(index: number, take: () => void) {
    falling.value++
    take()
    await nextTick()
    const buttons =
      list.value?.querySelectorAll<HTMLElement>('li:not(.fall-leave-active) .remove') ?? []
    const next = buttons[Math.min(index, buttons.length - 1)]
    if (next) next.focus()
    else focusAfterFall = count() === 0 ? 'empty' : 'heading'
  }

  /** A card has finished falling. */
  async function fallen() {
    falling.value = Math.max(0, falling.value - 1)
    if (falling.value > 0 || !focusAfterFall) return
    const target = focusAfterFall
    focusAfterFall = null
    await nextTick()
    ;(target === 'empty' ? emptyHeading : heading).value?.focus()
  }

  return { falling, empty, remove, fallen }
}

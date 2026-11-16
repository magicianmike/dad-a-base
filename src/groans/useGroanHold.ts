import { computed, onScopeDispose, ref } from 'vue'
import { GROAN_TAP_MS, groanFraction } from './score'

/**
 * A long press: `start` when the pointer or key goes down, `release` when it comes up, and `cancel` if it slides off
 * or is interrupted. Only a press held past a tap (300ms) begins a hold: a shorter one records nothing, and calls
 * `onTooShort` so the button can say how it works. While held, `fraction` fills from 0 to 1 over 3 seconds from the
 * moment of the press, each frame. Release records the hold; cancel records nothing and empties it.
 */
export function useGroanHold(
  onRelease: (fraction: number) => void,
  { onTooShort }: { onTooShort?: () => void } = {},
) {
  const holding = ref(false)
  const fraction = ref(0)
  const full = computed(() => fraction.value >= 1)
  let pressedAt = 0
  let frame = 0
  let waiting: ReturnType<typeof setTimeout> | undefined

  const held = () => groanFraction(performance.now() - pressedAt)

  function tick() {
    fraction.value = held()
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    clearTimeout(waiting)
    waiting = undefined
    cancelAnimationFrame(frame)
    holding.value = false
  }

  function start() {
    if (holding.value || waiting) return
    pressedAt = performance.now()
    waiting = setTimeout(() => {
      waiting = undefined
      holding.value = true
      tick()
    }, GROAN_TAP_MS)
  }

  function release() {
    if (waiting) {
      stop()
      onTooShort?.()
      return
    }
    if (!holding.value) return
    const recorded = held()
    stop()
    fraction.value = recorded
    onRelease(recorded)
  }

  function cancel() {
    if (!waiting && !holding.value) return
    stop()
    fraction.value = 0
  }

  /** Whether a press is down: waiting to become a hold, or holding. */
  const pressed = () => waiting !== undefined || holding.value

  onScopeDispose(stop)

  return { holding, fraction, full, start, release, cancel, pressed }
}

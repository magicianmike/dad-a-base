import { computed, onScopeDispose, ref } from 'vue'
import { GROAN_TAP_MS, groanFraction } from './score'

/** How far a held pointer can wander before the hold is slid off: a touch target's width, in CSS pixels. */
export const SLIDE_OFF_DISTANCE = 44

const HOLD_KEYS = [' ', 'Enter']

/**
 * A long press: `start` when the pointer or key goes down, `release` when it comes up, and `cancel` if it slides off
 * or is interrupted. `handlers` wires those to a button's pointer, touch and key events. Only a press held past a tap (300ms) begins a hold: a shorter one records nothing, and calls
 * `onTooShort` so the button can say how it works. While held, `fraction` fills from 0 to 1 over 3 seconds from the
 * moment of the press, each frame. Release records the hold; cancel records nothing and empties it.
 */
export function useGroanHold(
  onRelease: (fraction: number) => void,
  {
    onTooShort,
    onPress,
    onEscape,
  }: {
    onTooShort?: () => void
    /** A press has begun, by pointer or key. */
    onPress?: () => void
    /** Escape was pressed on the button. */
    onEscape?: () => void
  } = {},
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

  /*
   * The button grows with its "Ughhh", so it holds on to the pointer while pressed, and a hold is slid off only when
   * the pointer moves away from where it pressed, by more than a touch target, not when the button moves under it.
   * The lift is heard on the whole window, as a pointer or a touch, since Safari on iOS doesn't always send the
   * button its own: a hold that misses its lift would keep going until the next tap.
   */
  let pointerAt = { x: 0, y: 0 }

  function lift() {
    unlisten()
    release()
  }

  function interrupt() {
    unlisten()
    cancel()
  }

  function listen() {
    addEventListener('pointerup', lift)
    addEventListener('touchend', lift)
    addEventListener('pointercancel', interrupt)
    addEventListener('touchcancel', interrupt)
  }

  function unlisten() {
    removeEventListener('pointerup', lift)
    removeEventListener('touchend', lift)
    removeEventListener('pointercancel', interrupt)
    removeEventListener('touchcancel', interrupt)
  }

  const handlers = {
    onPointerdown(event: PointerEvent) {
      if (event.button !== 0) return
      pointerAt = { x: event.clientX, y: event.clientY }
      onPress?.()
      start()
      listen()
      try {
        ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
      } catch {
        // A pointer that can't be captured still holds; only slide-off is less precise.
      }
    },

    onPointermove(event: PointerEvent) {
      if (!pressed()) return
      const away = Math.hypot(event.clientX - pointerAt.x, event.clientY - pointerAt.y)
      if (away > SLIDE_OFF_DISTANCE) interrupt()
    },

    onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        cancel()
        onEscape?.()
        return
      }
      if (!HOLD_KEYS.includes(event.key)) return
      // The button's own click, on Enter now or Space on release, isn't wanted: the hold is the press.
      event.preventDefault()
      if (event.repeat) return
      onPress?.()
      start()
    },

    onKeyup(event: KeyboardEvent) {
      if (!HOLD_KEYS.includes(event.key)) return
      event.preventDefault()
      release()
    },

    /** Focus leaving cancels it. */
    onBlur: interrupt,
  }

  onScopeDispose(() => {
    stop()
    unlisten()
  })

  return { holding, fraction, full, start, release, cancel, pressed, handlers }
}

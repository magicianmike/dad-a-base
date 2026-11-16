import { effectScope } from 'vue'
import { SLIDE_OFF_DISTANCE, useGroanHold } from './useGroanHold'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function setup() {
  const released = vi.fn<(fraction: number) => void>()
  const tooShort = vi.fn()
  const scope = effectScope()
  const hold = scope.run(() => useGroanHold(released, { onTooShort: tooShort }))!
  return { hold, released, tooShort, scope }
}

describe('useGroanHold', () => {
  it('begins only once it’s held past a tap, then fills from the press, and records on release', () => {
    const { hold, released } = setup()
    expect(hold.holding.value).toBe(false)
    hold.start()
    expect(hold.holding.value).toBe(false)
    expect(hold.pressed()).toBe(true)
    vi.advanceTimersByTime(300)
    expect(hold.holding.value).toBe(true)
    vi.advanceTimersByTime(1200)
    expect(hold.fraction.value).toBeCloseTo(0.5, 1)
    expect(hold.full.value).toBe(false)
    hold.release()
    expect(released).toHaveBeenCalledOnce()
    expect(released.mock.calls[0]![0]).toBeCloseTo(0.5, 2)
    expect(hold.holding.value).toBe(false)
  })

  it('is full at 3 seconds, and stays full however long it’s held', () => {
    const { hold, released } = setup()
    hold.start()
    vi.advanceTimersByTime(3100)
    expect(hold.full.value).toBe(true)
    vi.advanceTimersByTime(5000)
    hold.release()
    expect(released).toHaveBeenCalledWith(1)
  })

  it('records nothing for a tap, and says it was too short', () => {
    const { hold, released, tooShort } = setup()
    hold.start()
    vi.advanceTimersByTime(250)
    hold.release()
    expect(released).not.toHaveBeenCalled()
    expect(tooShort).toHaveBeenCalledOnce()
    expect(hold.pressed()).toBe(false)
    // Nothing begins later, either.
    vi.advanceTimersByTime(500)
    expect(hold.holding.value).toBe(false)
  })

  it('a cancelled press never begins', () => {
    const { hold, released, tooShort } = setup()
    hold.start()
    hold.cancel()
    vi.advanceTimersByTime(1000)
    expect(hold.holding.value).toBe(false)
    hold.release()
    expect(released).not.toHaveBeenCalled()
    expect(tooShort).not.toHaveBeenCalled()
  })

  it('records nothing when cancelled, and empties', () => {
    const { hold, released } = setup()
    hold.start()
    vi.advanceTimersByTime(1000)
    hold.cancel()
    expect(hold.holding.value).toBe(false)
    expect(hold.fraction.value).toBe(0)
    hold.release()
    expect(released).not.toHaveBeenCalled()
  })

  it('ignores a second start, so a held key’s repeats don’t restart it', () => {
    const { hold, released } = setup()
    hold.start()
    vi.advanceTimersByTime(1500)
    hold.start()
    vi.advanceTimersByTime(1500)
    hold.release()
    expect(released).toHaveBeenCalledWith(1)
  })

  it('stops filling when its scope ends', () => {
    const { hold, scope } = setup()
    hold.start()
    vi.advanceTimersByTime(500)
    scope.stop()
    const fraction = hold.fraction.value
    vi.advanceTimersByTime(1000)
    expect(hold.fraction.value).toBe(fraction)
  })
})

describe('useGroanHold’s handlers', () => {
  const pointer = (type: string, init: MouseEventInit = {}) =>
    new MouseEvent(type, { button: 0, ...init }) as PointerEvent
  const key = (type: string, init: KeyboardEventInit) =>
    new KeyboardEvent(type, { cancelable: true, ...init })

  it('hear the lift anywhere, as a pointer or a touch, and only once', () => {
    const { hold, released } = setup()
    hold.handlers.onPointerdown(pointer('pointerdown'))
    vi.advanceTimersByTime(1000)
    dispatchEvent(new Event('touchend'))
    expect(released).toHaveBeenCalledOnce()
    dispatchEvent(new Event('pointerup'))
    expect(released).toHaveBeenCalledOnce()
  })

  it('cancel on a pointer or touch cancel heard anywhere', () => {
    for (const type of ['pointercancel', 'touchcancel']) {
      const { hold, released } = setup()
      hold.handlers.onPointerdown(pointer('pointerdown'))
      vi.advanceTimersByTime(1000)
      dispatchEvent(new Event(type))
      dispatchEvent(new Event('pointerup'))
      expect(released).not.toHaveBeenCalled()
    }
  })

  it('ignore all but the main button, and say when a press begins', () => {
    const onPress = vi.fn()
    const scope = effectScope()
    const hold = scope.run(() => useGroanHold(vi.fn(), { onPress }))!
    hold.handlers.onPointerdown(pointer('pointerdown', { button: 2 }))
    expect(hold.pressed()).toBe(false)
    hold.handlers.onPointerdown(pointer('pointerdown'))
    expect(onPress).toHaveBeenCalledOnce()
    expect(hold.pressed()).toBe(true)
  })

  it('let a held pointer wobble, but slide off past a touch target', () => {
    const { hold, released } = setup()
    hold.handlers.onPointerdown(pointer('pointerdown', { clientX: 10, clientY: 10 }))
    vi.advanceTimersByTime(1000)
    hold.handlers.onPointermove(pointer('pointermove', { clientX: 40, clientY: 30 }))
    expect(hold.holding.value).toBe(true)
    hold.handlers.onPointermove(
      pointer('pointermove', { clientX: 10 + SLIDE_OFF_DISTANCE + 1, clientY: 10 }),
    )
    expect(hold.holding.value).toBe(false)
    dispatchEvent(new Event('pointerup'))
    expect(released).not.toHaveBeenCalled()
  })

  it('hold with Space or Enter, ignore repeats, keep the button’s own click, and cancel on Escape', () => {
    const onEscape = vi.fn()
    const released = vi.fn()
    const scope = effectScope()
    const hold = scope.run(() => useGroanHold(released, { onEscape }))!
    const down = key('keydown', { key: ' ' })
    hold.handlers.onKeydown(down)
    expect(down.defaultPrevented).toBe(true)
    vi.advanceTimersByTime(750)
    hold.handlers.onKeydown(key('keydown', { key: ' ', repeat: true }))
    vi.advanceTimersByTime(750)
    const up = key('keyup', { key: ' ' })
    hold.handlers.onKeyup(up)
    expect(up.defaultPrevented).toBe(true)
    expect(released.mock.calls[0]![0]).toBeCloseTo(0.5, 1)

    hold.handlers.onKeydown(key('keydown', { key: 'Enter' }))
    vi.advanceTimersByTime(1000)
    hold.handlers.onKeydown(key('keydown', { key: 'Escape' }))
    expect(onEscape).toHaveBeenCalledOnce()
    expect(hold.holding.value).toBe(false)

    const other = key('keydown', { key: 'a' })
    hold.handlers.onKeydown(other)
    hold.handlers.onKeyup(key('keyup', { key: 'a' }))
    expect(other.defaultPrevented).toBe(false)
    expect(released).toHaveBeenCalledOnce()
  })

  it('cancel when focus leaves', () => {
    const { hold, released } = setup()
    hold.handlers.onPointerdown(pointer('pointerdown'))
    vi.advanceTimersByTime(1000)
    hold.handlers.onBlur()
    dispatchEvent(new Event('pointerup'))
    expect(released).not.toHaveBeenCalled()
  })
})

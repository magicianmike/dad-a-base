import { effectScope } from 'vue'
import { useGroanHold } from './useGroanHold'

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

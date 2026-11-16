import { effectScope, nextTick, ref } from 'vue'
import { useMinimumBusy } from './useMinimumBusy'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function setup(initial = false) {
  const loading = ref(initial)
  const scope = effectScope()
  const busy = scope.run(() => useMinimumBusy(loading, 500))!
  return { loading, busy, scope }
}

describe('useMinimumBusy', () => {
  it('stays busy for the minimum when loading is quick', async () => {
    const { loading, busy } = setup()
    loading.value = true
    await nextTick()
    vi.advanceTimersByTime(100)
    loading.value = false
    await nextTick()
    expect(busy.value).toBe(true)
    vi.advanceTimersByTime(399)
    expect(busy.value).toBe(true)
    vi.advanceTimersByTime(1)
    expect(busy.value).toBe(false)
  })

  it('stops as soon as loading does when it took longer than the minimum', async () => {
    const { loading, busy } = setup()
    loading.value = true
    await nextTick()
    vi.advanceTimersByTime(800)
    loading.value = false
    await nextTick()
    vi.advanceTimersByTime(0)
    expect(busy.value).toBe(false)
  })

  it('follows loading that starts out true, as on first load', async () => {
    const { loading, busy } = setup(true)
    expect(busy.value).toBe(true)
    loading.value = false
    await nextTick()
    vi.advanceTimersByTime(0)
    expect(busy.value).toBe(false)
  })

  it('starts the minimum again when loading starts again', async () => {
    const { loading, busy } = setup()
    loading.value = true
    await nextTick()
    loading.value = false
    await nextTick()
    vi.advanceTimersByTime(400)
    loading.value = true
    await nextTick()
    loading.value = false
    await nextTick()
    vi.advanceTimersByTime(400)
    expect(busy.value).toBe(true)
    vi.advanceTimersByTime(100)
    expect(busy.value).toBe(false)
  })

  it('clears its timer when its scope ends', async () => {
    const { loading, scope } = setup()
    loading.value = true
    await nextTick()
    loading.value = false
    await nextTick()
    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})

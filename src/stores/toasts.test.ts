import { createPinia, setActivePinia } from 'pinia'
import { TOAST_DURATION_MS, useToastsStore } from './toasts'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

describe('useToastsStore', () => {
  it('shows toasts in order and lets each go after a while', () => {
    const store = useToastsStore()
    store.show('One')
    vi.advanceTimersByTime(1000)
    store.show('Two')
    expect(store.toasts.map(({ message }) => message)).toEqual(['One', 'Two'])

    vi.advanceTimersByTime(TOAST_DURATION_MS - 1000)
    expect(store.toasts.map(({ message }) => message)).toEqual(['Two'])
    vi.advanceTimersByTime(1000)
    expect(store.toasts).toEqual([])
  })

  it('dismisses one on request', () => {
    const store = useToastsStore()
    store.show('One')
    store.show('Two')
    store.dismiss(store.toasts[0]!.id)
    expect(store.toasts.map(({ message }) => message)).toEqual(['Two'])
  })
})

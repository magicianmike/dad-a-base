import { fireEvent, screen } from '@testing-library/vue'
import { jokes } from '@/mocks/fixtures'
import { useGroansStore } from '@/stores/groans'
import { renderPage } from '@/test/renderPage'
import GroanButton from './GroanButton.vue'

const joke = jokes[0]!

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

async function hold(ms: number, { press, lift }: { press: () => unknown; lift: () => unknown }) {
  await press()
  await vi.advanceTimersByTimeAsync(ms)
  await lift()
}

const pointer = (button: HTMLElement) => ({
  press: () => fireEvent.pointerDown(button, { button: 0 }),
  lift: () => fireEvent.pointerUp(button, { button: 0 }),
})

describe('GroanButton', () => {
  it('is named "Groan", described by its tooltip', async () => {
    await renderPage(GroanButton, { props: { joke } })
    const button = screen.getByRole('button', { name: 'Groan' })
    expect(button).toHaveAccessibleDescription(
      'Press and hold to groan, the longer the groan the worse the joke.',
    )
  })

  it('records a held Groan, announces its score, and its label groans louder as it fills', async () => {
    await renderPage(GroanButton, { props: { joke } })
    const button = screen.getByRole('button', { name: 'Groan' })
    await fireEvent.pointerDown(button, { button: 0 })
    await vi.advanceTimersByTimeAsync(1100)
    // An h every quarter second, behind a hidden "Groan: " so the name still says what it is.
    expect(button).toHaveAccessibleName(`Groan: Ugh${'h'.repeat(4)}`)
    await vi.advanceTimersByTimeAsync(1000)
    expect(button).toHaveAccessibleName(`Groan: Ugh${'h'.repeat(8)}`)
    await vi.advanceTimersByTimeAsync(1000)
    expect(button).toHaveAccessibleName(`Groan: Ugh${'h'.repeat(12)}!`)
    expect(button.closest('.groan')).toHaveClass('full')
    await fireEvent.pointerUp(button, { button: 0 })
    // Let go, it stops shaking, though it rests full.
    expect(button.closest('.groan')).not.toHaveClass('full')

    expect(useGroansStore().scoreOf(joke.id)).toBe(1)
    expect(screen.getByRole('status')).toHaveTextContent('Groan score 10.0 out of 10.')
    expect(screen.getByText('GROAN! 10.0')).toBeInTheDocument()
    // The full "Ughhh…!" stays after it's let go.
    expect(button).toHaveAccessibleName(`Groan: Ugh${'h'.repeat(12)}!`)
    expect(button).toHaveAccessibleDescription(
      'Your groan: 10.0/10. Press and hold to groan, the longer the groan the worse the joke.',
    )
  })

  it('records nothing for a tap, and shows how it works for a moment instead', async () => {
    await renderPage(GroanButton, { props: { joke } })
    const button = screen.getByRole('button', { name: 'Groan' })
    await hold(200, pointer(button))
    expect(useGroansStore().groans).toEqual([])
    expect(button).toHaveAccessibleName('Groan')
    expect(button.closest('.groan')).toHaveClass('hinting')
    await vi.advanceTimersByTimeAsync(2600)
    expect(button.closest('.groan')).not.toHaveClass('hinting')
  })

  it('hears the lift anywhere, as a pointer or a touch, so a hold never misses its end', async () => {
    await renderPage(GroanButton, { props: { joke } })
    const button = screen.getByRole('button', { name: 'Groan' })
    await hold(1000, { press: pointer(button).press, lift: () => fireEvent.touchEnd(window) })
    expect(useGroansStore().scoreOf(joke.id)).toBeCloseTo(1 / 3, 1)

    // Lifted once, it doesn't record again on the next lift.
    await fireEvent.pointerUp(document.body)
    expect(useGroansStore().groans).toHaveLength(1)
  })

  it('records nothing when the pointer slides off, is cancelled, or isn’t the main button', async () => {
    await renderPage(GroanButton, { props: { joke } })
    const button = screen.getByRole('button', { name: 'Groan' })
    await hold(1000, {
      press: () => fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10 }),
      lift: async () => {
        // A wobble is fine; sliding well away isn't.
        await fireEvent.pointerMove(button, { clientX: 30, clientY: 20 })
        expect(button).toHaveAccessibleName(/^Groan: Ugh/)
        await fireEvent.pointerMove(button, { clientX: 80, clientY: 10 })
        await fireEvent.pointerUp(button, { button: 0 })
      },
    })
    await hold(1000, { press: pointer(button).press, lift: () => fireEvent.pointerCancel(button) })
    await hold(1000, {
      press: () => fireEvent.pointerDown(button, { button: 2 }),
      lift: () => fireEvent.pointerUp(button, { button: 2 }),
    })
    expect(useGroansStore().groans).toEqual([])
  })

  it.each([
    ['Space', ' '],
    ['Enter', 'Enter'],
  ])('holds with %s, ignoring its repeats', async (_, key) => {
    await renderPage(GroanButton, { props: { joke } })
    const button = screen.getByRole('button', { name: 'Groan' })
    await hold(1500, {
      press: async () => {
        await fireEvent.keyDown(button, { key })
        await vi.advanceTimersByTimeAsync(750)
        await fireEvent.keyDown(button, { key, repeat: true })
      },
      lift: () => fireEvent.keyUp(button, { key }),
    })
    expect(useGroansStore().scoreOf(joke.id)).toBeCloseTo(0.75, 1)
  })

  it('cancels with Escape, or when focus leaves', async () => {
    await renderPage(GroanButton, { props: { joke } })
    const button = screen.getByRole('button', { name: 'Groan' })
    await hold(1000, {
      press: () => fireEvent.keyDown(button, { key: ' ' }),
      lift: async () => {
        await fireEvent.keyDown(button, { key: 'Escape' })
        await fireEvent.keyUp(button, { key: ' ' })
      },
    })
    await hold(1000, { press: pointer(button).press, lift: () => fireEvent.blur(button) })
    await fireEvent.keyUp(button, { key: 'a' })
    expect(useGroansStore().groans).toEqual([])
  })

  it('a new Groan replaces the last, and the burst goes after a moment', async () => {
    await renderPage(GroanButton, { props: { joke } })
    const button = screen.getByRole('button', { name: 'Groan' })
    await hold(3000, pointer(button))
    await hold(600, pointer(button))
    expect(useGroansStore().scoreOf(joke.id)).toBeCloseTo(0.2, 1)
    expect(screen.getByText('GROAN! 2.0')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(1500)
    expect(screen.queryByText(/GROAN!/)).toBeNull()
  })
})

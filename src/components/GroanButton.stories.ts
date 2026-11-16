import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor } from 'storybook/test'
import { jokes } from '@/mocks/fixtures'
import { GROANS_STORAGE_KEY, useGroansStore } from '@/stores/groans'
import GroanButton from './GroanButton.vue'

const joke = jokes[0]!
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const level = (button: HTMLElement) =>
  Number(getComputedStyle(button).getPropertyValue('--groan-level'))

const meta = {
  component: GroanButton,
  args: { joke },
  // Room above for the tooltip and the burst.
  parameters: { layout: 'centered' },
  beforeEach: () => () => localStorage.removeItem(GROANS_STORAGE_KEY),
  // Storybook shares one Pinia across stories, so each starts with no Groans unless it says otherwise.
  decorators: [
    (_, { parameters }) => {
      useGroansStore().groans = parameters.groans ?? []
      return { template: '<div style="padding-top: 8rem"><story /></div>' }
    },
  ],
} satisfies Meta<typeof GroanButton>

export default meta
type Story = StoryObj<typeof meta>

/** Empty, named "Groan", with its tooltip as its description. */
export const Idle: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Groan' })
    await expect(button).toHaveTextContent('Groan')
    await expect(button).toHaveAccessibleDescription(
      'Press and hold to groan, the longer the groan the worse the joke.',
    )
    await expect(level(button)).toBe(0)
  },
}

/** Focused from the keyboard: the tooltip says how it works. (A real hover, and its nudge, are tested in Playwright.) */
export const Focused: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Groan' })).toHaveFocus()
    await waitFor(() => expect(canvas.getByRole('tooltip')).toBeVisible())
  },
}

/** Held for a second: about a third full, and groaning: "Ughhhhh". */
export const Holding: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Groan' })
    await userEvent.pointer({ keys: '[MouseLeft>]', target: button })
    await wait(1000)
    await expect(level(button)).toBeGreaterThan(0.25)
    // About four h's by now, one each quarter second, after a hidden "Groan: ".
    await expect(button).toHaveAccessibleName(/^Groan: Ughhhh+$/)
  },
}

/** Held past 3 seconds: full, shaking, and "Ughhhhhhhhhhhhh!". Let go, it records 10.0, and the label stays. */
export const Full: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Groan' })
    await userEvent.pointer({ keys: '[MouseLeft>]', target: button })
    await wait(3100)
    await expect(button).toHaveAccessibleName(`Groan: Ugh${'h'.repeat(12)}!`)
    await expect(level(button)).toBe(1)
    await userEvent.pointer({ keys: '[/MouseLeft]', target: button })
    await waitFor(() => expect(canvas.getByText('GROAN! 10.0')).toBeVisible())
    await expect(useGroansStore().scoreOf(joke.id)).toBe(1)
    await expect(button).toHaveAccessibleName(`Groan: Ugh${'h'.repeat(12)}!`)
  },
}

/** Groaned at before: the fill rests at the score, and the tooltip says it. No nudge. */
export const Groaned: Story = {
  parameters: { groans: [{ joke, score: 0.72, groanedAt: '2026-11-16T12:00:00.000Z' }] },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /^Groan/ })
    await expect(button).toHaveAccessibleDescription(
      'Your groan: 7.2/10. Press and hold to groan, the longer the groan the worse the joke.',
    )
    // 7.2 is eight h's' worth.
    await expect(button).toHaveAccessibleName(`Groan: Ugh${'h'.repeat(8)}`)
    await userEvent.hover(button)
    await wait(400)
    await expect(level(button)).toBeCloseTo(0.72)
  },
}

/** A quick press isn't a Groan: it records nothing, and shows how it works for a moment, as a phone has no hover. */
export const Tap: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Groan' })
    await userEvent.click(button)
    await waitFor(() => expect(canvas.getByRole('tooltip')).toBeVisible())
    await expect(canvas.queryByText(/GROAN!/)).toBeNull()
    await expect(useGroansStore().groans).toEqual([])
  },
}

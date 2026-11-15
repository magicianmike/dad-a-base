import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn } from 'storybook/test'
import { jokes } from '@/mocks/fixtures'
import ShareButton from './ShareButton.vue'

const meta = { component: ShareButton, args: { joke: jokes[0]! } } satisfies Meta<
  typeof ShareButton
>

export default meta
type Story = StoryObj<typeof meta>

/** With the system share sheet, the Joke's text and page go to it. */
export const ShareSheet: Story = {
  beforeEach: () => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: fn(async () => {}) })
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    return () => {
      delete (navigator as { share?: unknown }).share
      delete (navigator as { canShare?: unknown }).canShare
    }
  },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share' }))
    await expect(navigator.share).toHaveBeenCalledWith(
      expect.objectContaining({
        text: args.joke.joke,
        url: expect.stringMatching(new RegExp(`/jokes/${args.joke.id}$`)),
      }),
    )
  },
}

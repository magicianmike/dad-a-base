import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import { jokes } from '@/mocks/fixtures'
import JokeCard from './JokeCard.vue'

const meta = {
  component: JokeCard,
  args: { joke: jokes[0]! },
} satisfies Meta<typeof JokeCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement, args }) => {
    await expect(canvas.getByRole('blockquote')).toHaveTextContent(args.joke.joke)
    await expect(canvasElement.querySelector('figcaption')).toBeNull()
  },
}

export const WithCaption: Story = {
  args: { caption: 'Witnesses report groaning.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Witnesses report groaning.')).toBeInTheDocument()
  },
}

export const Long: Story = {
  args: {
    joke: {
      id: 'long',
      joke: 'I used to hate facial hair, but then it grew on me. And then it grew on my chin, my cheeks and, frankly, somewhere near my ears, which nobody asked for.',
    },
  },
}

/** In a list of results: compact, with the Joke's text linking to its page. */
export const Linked: Story = {
  args: { compact: true, to: `/jokes/${jokes[0]!.id}` },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('link', { name: args.joke.joke })).toHaveAttribute(
      'href',
      `/jokes/${args.joke.id}`,
    )
  },
}

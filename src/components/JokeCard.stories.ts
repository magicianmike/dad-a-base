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
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('blockquote')).toHaveTextContent(args.joke.joke)
    await expect(canvas.getByText(`Joke #${args.joke.id}`)).toBeInTheDocument()
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

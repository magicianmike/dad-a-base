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
    await expect(canvas.getByText(args.joke.joke)).toBeInTheDocument()
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

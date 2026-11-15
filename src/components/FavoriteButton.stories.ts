import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import { jokes } from '@/mocks/fixtures'
import { FAVORITES_STORAGE_KEY } from '@/stores/favorites'
import FavoriteButton from './FavoriteButton.vue'

const meta = {
  component: FavoriteButton,
  args: { joke: jokes[0]! },
  beforeEach: () => () => localStorage.removeItem(FAVORITES_STORAGE_KEY),
} satisfies Meta<typeof FavoriteButton>

export default meta
type Story = StoryObj<typeof meta>

export const Toggles: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Favorite' })
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await userEvent.keyboard('{Enter}')
    await expect(button).toHaveAttribute('aria-pressed', 'false')
  },
}

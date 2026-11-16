import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import { jokes } from '@/mocks/fixtures'
import { FAVORITES_STORAGE_KEY, useFavoritesStore } from '@/stores/favorites'
import FavoriteButton from './FavoriteButton.vue'

const meta = {
  component: FavoriteButton,
  args: { joke: jokes[0]! },
  beforeEach: () => () => localStorage.removeItem(FAVORITES_STORAGE_KEY),
  // Storybook shares one Pinia across stories, so each starts with no Favorites, whatever ran before. A decorator
  // runs inside the app, once its Pinia is installed.
  decorators: [
    () => {
      useFavoritesStore().favorites = []
      return { template: '<story />' }
    },
  ],
} satisfies Meta<typeof FavoriteButton>

export default meta
type Story = StoryObj<typeof meta>

export const Toggles: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Favorite' })
    await expect(button).not.toHaveAttribute('aria-pressed')
    await userEvent.click(button)
    await expect(button).toHaveAccessibleName('Favorited')
    await userEvent.keyboard('{Enter}')
    await expect(button).toHaveAccessibleName('Favorite')
  },
}

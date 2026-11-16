import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { archive } from '@/mocks/fixtures'
import { FAVORITES_STORAGE_KEY, useFavoritesStore } from '@/stores/favorites'
import FavoritesPeek from './FavoritesPeek.vue'

/** Saves these Jokes as Favorites before the story renders, oldest first, so the last is the newest. */
const saving = (count: number) => () => {
  const store = useFavoritesStore()
  store.favorites = []
  for (const joke of archive.slice(0, count)) store.toggle(joke)
  return { template: '<story />' }
}

const meta = {
  component: FavoritesPeek,
  beforeEach: () => () => localStorage.removeItem(FAVORITES_STORAGE_KEY),
} satisfies Meta<typeof FavoritesPeek>

export default meta
type Story = StoryObj<typeof meta>

/** No Favorites: home shows nothing here. */
export const None: Story = {
  decorators: [saving(0)],
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('region', { name: 'From your fridge' })).toBeNull()
  },
}

/** A few: all of them, and a link to the page. */
export const Few: Story = {
  decorators: [saving(2)],
  play: async ({ canvas }) => {
    const peek = canvas.getByRole('region', { name: 'From your fridge' })
    await expect(within(peek).getAllByRole('listitem')).toHaveLength(2)
    await expect(within(peek).getByRole('link', { name: 'Go to your favorites' })).toHaveAttribute(
      'href',
      '/favorites',
    )
  },
}

/** More than three: the newest three, and how many there are in all. */
export const Many: Story = {
  decorators: [saving(5)],
  play: async ({ canvas }) => {
    const peek = canvas.getByRole('region', { name: 'From your fridge' })
    const items = within(peek).getAllByRole('listitem')
    await expect(items).toHaveLength(3)
    await expect(within(items[0]!).getByRole('link')).toHaveAttribute(
      'href',
      `/jokes/${archive[4]!.id}`,
    )
    await expect(within(peek).getByRole('link', { name: 'See all 5 favorites' })).toBeVisible()
  },
}

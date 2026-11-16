import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { RECENT_SEARCHES_STORAGE_KEY, useRecentSearchesStore } from '@/stores/recentSearches'
import SearchSuggestions from './SearchSuggestions.vue'

const meta = {
  component: SearchSuggestions,
  args: { to: (term: string) => ({ path: '/search', query: { q: term } }) },
  beforeEach: () => () => localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY),
} satisfies Meta<typeof SearchSuggestions>

export default meta
type Story = StoryObj<typeof meta>

export const Suggested: Story = {
  play: async ({ canvas }) => {
    const suggested = canvas.getByRole('region', { name: 'Try searching for' })
    await expect(within(suggested).getByRole('link', { name: 'cat' })).toHaveAttribute(
      'href',
      '/search?q=cat',
    )
    await expect(canvas.queryByRole('region', { name: 'Recent searches' })).toBeNull()
  },
}

/** With recent searches, which can be cleared. */
export const WithRecent: Story = {
  args: { recent: true },
  decorators: [
    () => {
      const store = useRecentSearchesStore()
      store.clear()
      store.remember('golf')
      store.remember('pizza')
      return { template: '<story />' }
    },
  ],
  play: async ({ canvas, userEvent }) => {
    const recent = canvas.getByRole('region', { name: 'Recent searches' })
    await expect(
      within(recent)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['pizza', 'golf'])

    await userEvent.click(canvas.getByRole('button', { name: 'Clear recent searches' }))
    await expect(canvas.queryByRole('region', { name: 'Recent searches' })).toBeNull()
    await expect(canvas.getByRole('heading', { name: 'Try searching for' })).toHaveFocus()
  },
}

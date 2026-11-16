import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import PaginationStates from './PaginationStates.vue'

const meta = { component: PaginationStates } satisfies Meta<typeof PaginationStates>

export default meta
type Story = StoryObj<typeof meta>

/** The window at page 2: full at the start, 1 to 11. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Page 2' }))
    const pages = canvas.getByRole('navigation', { name: 'Pages' })
    const numbers = within(pages).getAllByRole('link', { name: /^Page/ })
    await expect(numbers.map((link) => link.textContent)).toEqual(
      Array.from({ length: 11 }, (_, i) => String(i + 1)),
    )
  },
}

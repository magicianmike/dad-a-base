import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import SearchPagination from './SearchPagination.vue'

const meta = {
  component: SearchPagination,
  args: { page: 1, totalPages: 40, to: (page: number) => ({ query: { q: 'pun', page } }) },
} satisfies Meta<typeof SearchPagination>

export default meta
type Story = StoryObj<typeof meta>

const numbers = (canvas: HTMLElement) =>
  within(canvas)
    .getAllByRole('listitem')
    .map((item) => Number(item.textContent))

/** The first page: Previous is disabled, and the window shows 1–11. */
export const FirstPage: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await expect(canvas.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'href',
      '/?q=pun&page=2',
    )
    await expect(numbers(canvasElement)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    await expect(canvas.getByRole('link', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/** Page 8 of 40: 5 on each side. */
export const Middle: Story = {
  args: { page: 8 },
  play: async ({ canvas, canvasElement }) => {
    await expect(numbers(canvasElement)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    await expect(canvas.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/?q=pun&page=7',
    )
  },
}

/** Page 38 of 40: kept full at the end. */
export const NearTheEnd: Story = {
  args: { page: 38 },
  play: async ({ canvasElement }) => {
    await expect(numbers(canvasElement)).toEqual([30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40])
  },
}

/** The last page: Next is disabled. */
export const LastPage: Story = {
  args: { page: 5, totalPages: 5 },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await expect(numbers(canvasElement)).toEqual([1, 2, 3, 4, 5])
  },
}

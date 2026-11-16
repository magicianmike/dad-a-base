import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, waitFor } from 'storybook/test'
import SectionsMenu from './SectionsMenu.vue'

const meta = {
  component: SectionsMenu,
  globals: { viewport: { value: 'mobile1' } },
} satisfies Meta<typeof SectionsMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Sections' })).toBeVisible()
    await expect(canvas.queryByRole('dialog')).toBeNull()
  },
}

export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Sections' }))
    const drawer = canvas.getByRole('dialog', { name: 'Sections' })
    await expect(drawer).toBeVisible()
    const nav = canvas.getByRole('navigation', { name: 'Main' })
    await expect([...nav.querySelectorAll('a')].map((link) => link.textContent)).toEqual([
      'Home',
      'Search',
      'Random',
      'Faves',
      'Groans',
    ])
  },
}

export const Closing: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Sections' })
    const closed = () => waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull())

    // Escape is a native dialog's own, which simulated keys can't press: Playwright covers it.

    // Close.
    await userEvent.click(button)
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }))
    await closed()

    // A tap on the backdrop, which lands on the dialog itself.
    await userEvent.click(button)
    await fireEvent.click(canvas.getByRole('dialog'))
    await closed()

    // Choosing a section.
    await userEvent.click(button)
    await userEvent.click(canvas.getByRole('link', { name: 'Random' }))
    await closed()
  },
}

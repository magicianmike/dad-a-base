import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import SiteHeader from './SiteHeader.vue'

const meta = {
  component: SiteHeader,
  args: { date: new Date(2026, 10, 14) },
} satisfies Meta<typeof SiteHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('Saturday, November 14, 2026')).toBeInTheDocument()
    await expect(canvas.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()

    // The skip link is first, and shows itself when focused.
    await userEvent.tab()
    const skip = canvas.getByRole('link', { name: 'Skip to the main story' })
    await expect(skip).toHaveFocus()
    await expect(skip).toHaveAttribute('href', '#main')
  },
}

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

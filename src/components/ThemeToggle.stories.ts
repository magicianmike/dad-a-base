import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import ThemeToggle from './ThemeToggle.vue'

const meta = { component: ThemeToggle } satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Dark theme' })
    const startsDark = toggle.getAttribute('aria-pressed') === 'true'

    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-pressed', String(!startsDark))
    await expect(document.documentElement.dataset.theme).toBe(startsDark ? 'light' : 'dark')

    // It's a button, so Space toggles it back.
    await userEvent.keyboard(' ')
    await expect(toggle).toHaveAttribute('aria-pressed', String(startsDark))
    await expect(document.documentElement.dataset.theme).toBe(startsDark ? 'dark' : 'light')

    localStorage.removeItem('dadabase:theme')
    delete document.documentElement.dataset.theme
  },
}

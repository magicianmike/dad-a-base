import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import SiteFooter from './SiteFooter.vue'

const meta = { component: SiteFooter } satisfies Meta<typeof SiteFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'icanhazdadjoke.com' })).toHaveAttribute(
      'href',
      'https://icanhazdadjoke.com',
    )
    const colophon = canvas.getByRole('navigation', { name: 'Colophon' })
    await expect(colophon).toBeInTheDocument()
  },
}

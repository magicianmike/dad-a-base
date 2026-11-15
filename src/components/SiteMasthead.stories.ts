import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import SiteMasthead from './SiteMasthead.vue'

const meta = { component: SiteMasthead } satisfies Meta<typeof SiteMasthead>

export default meta
type Story = StoryObj<typeof meta>

export const Wide: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link')
    await expect(link).toHaveAccessibleName('The Dad-a-base')
    await expect(link).toHaveAttribute('href', '/')
    await expect(canvas.getByText(/Partly punny/)).toBeVisible()
  },
}

/** Below 48rem of its own width, the corner boxes go and the name centres. */
export const Narrow: Story = {
  decorators: [() => ({ template: '<div style="max-width: 22rem"><story /></div>' })],
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Partly punny/)).not.toBeVisible()
  },
}

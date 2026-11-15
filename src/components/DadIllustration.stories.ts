import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import DadIllustration from './DadIllustration.vue'

const meta = {
  component: DadIllustration,
  decorators: [() => ({ template: '<div style="width: 10rem"><story /></div>' })],
} satisfies Meta<typeof DadIllustration>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Decorative: the name beside it says what it is.
    await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  },
}
